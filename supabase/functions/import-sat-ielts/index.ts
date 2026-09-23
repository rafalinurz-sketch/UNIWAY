// ============================================================================
// UNIWAY — Supabase Edge Function: process one SAT/IELTS file from Storage
// into structured rows in the Database.
//
// WHAT THIS IS: a realistic starting point, not a finished OCR product.
// - It downloads one file from the "sat" or "ielts" bucket using the
//   SERVICE_ROLE key (which is safe here because Edge Functions run on
//   Supabase's servers, never in the browser).
// - For text-based PDFs it extracts real text and applies a conservative,
//   pattern-based question splitter (numbered questions, lettered options).
// - It NEVER invents a correct answer or explanation. If the source text
//   doesn't clearly contain one, the row is saved with correct_index = null,
//   explanation = null, and needs_review = true.
// - For SCANNED (image-only) PDFs, plain text extraction returns nothing
//   useful — real OCR needs an external OCR API (e.g. Google Cloud Vision,
//   AWS Textract, or a self-hosted Tesseract). This function has a clearly
//   marked TODO for that; it will not fabricate OCR results.
//
// DEPLOY (from your machine, with the Supabase CLI installed):
//   supabase functions deploy import-sat-ielts --project-ref ummjmbqrnbqzxvfxptru
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... --project-ref ummjmbqrnbqzxvfxptru
// (Get the service_role key from Dashboard → Project Settings → API — keep it
//  OUT of the frontend and out of git; Supabase secrets store it server-side only.)
//
// CALL IT (from the Admin page, or curl) with the anon key as a normal user,
// passing which file to process — the function itself uses the service_role
// key internally, so the browser never sees it:
//   POST https://<project>.functions.supabase.co/import-sat-ielts
//   { "bucket": "sat", "path": "some-file.pdf" }
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Text-based PDF extraction (works for text-layer PDFs, not scans):
import { getDocument } from 'https://esm.sh/pdfjs-dist@4.0.379/legacy/build/pdf.mjs';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; // set via `supabase secrets set`

Deno.serve(async (req) => {
  try {
    const { bucket, path } = await req.json();
    if (!bucket || !path) {
      return json({ error: 'bucket and path are required' }, 400);
    }
    if (bucket !== 'sat' && bucket !== 'ielts') {
      return json({ error: 'bucket must be "sat" or "ielts"' }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 1. Create/upsert the import_jobs row for tracking.
    const { data: fileBlob, error: dlErr } = await admin.storage.from(bucket).download(path);
    if (dlErr) return json({ error: 'Could not download file: ' + dlErr.message }, 404);

    const fileHash = await sha256(await fileBlob.arrayBuffer());
    const { data: existingJob } = await admin.from('import_jobs').select('id,status').eq('file_hash', fileHash).maybeSingle();
    if (existingJob && existingJob.status === 'done') {
      return json({ skipped: true, reason: 'Already imported (matching file hash).', job_id: existingJob.id });
    }

    const { data: job } = await admin.from('import_jobs').insert({
      bucket, file_name: path.split('/').pop(), file_path: path, file_hash: fileHash, status: 'processing', started_at: new Date().toISOString(),
    }).select().single();

    let extractedText = '';
    let ocrRequired = false;
    try {
      extractedText = await extractPdfText(await fileBlob.arrayBuffer());
      if (extractedText.trim().length < 40) ocrRequired = true; // suspiciously little text → likely a scanned image PDF
    } catch (e) {
      await admin.from('import_errors').insert({ import_job_id: job.id, file_name: path, error_message: 'Text extraction failed: ' + e.message });
      await admin.from('import_jobs').update({ status: 'error', finished_at: new Date().toISOString() }).eq('id', job.id);
      return json({ error: 'Text extraction failed', detail: e.message });
    }

    if (ocrRequired) {
      // TODO: call an OCR API here (Google Vision / AWS Textract / self-hosted Tesseract),
      // store the returned text into `extractedText`, then continue below.
      // Until an OCR provider is wired in, we do NOT fabricate content — we flag it for review.
      await admin.from('import_errors').insert({
        import_job_id: job.id, file_name: path,
        error_message: 'This looks like a scanned/image PDF — little or no extractable text. OCR is not configured yet; add an OCR provider in this function to process it.',
      });
      await admin.from('import_jobs').update({ status: 'error', finished_at: new Date().toISOString(), errors: 1 }).eq('id', job.id);
      return json({ needsOcr: true, job_id: job.id });
    }

    const parsed = bucket === 'sat' ? splitSatQuestions(extractedText) : splitIeltsContent(extractedText);

    let imported = 0, duplicates = 0, needsReview = 0;
    for (const q of parsed) {
      const hash = await sha256(new TextEncoder().encode(JSON.stringify(q.question + '|' + (q.choices || []).join('|'))).buffer);
      const row = bucket === 'sat'
        ? { id: crypto.randomUUID(), section: q.section, topic: q.topic || 'Unclassified', question: q.question, choices: q.choices, correct_index: q.correctIndex ?? null, explanation: q.explanation ?? null, source_file: path.split('/').pop(), source_path: path, question_hash: hash, needs_review: q.correctIndex == null }
        : { id: crypto.randomUUID(), title: q.title || path, text: q.passageText || extractedText.slice(0, 2000), source_file: path.split('/').pop(), source_path: path, needs_review: true };

      const table = bucket === 'sat' ? 'sat_questions' : 'ielts_reading_passages';
      const { error: insErr } = await admin.from(table).insert(row);
      if (insErr) {
        if (insErr.message.includes('duplicate key')) duplicates++;
        else await admin.from('import_errors').insert({ import_job_id: job.id, file_name: path, error_message: insErr.message });
      } else {
        imported++;
        if (row.needs_review) {
          needsReview++;
          await admin.from('question_review_queue').insert({ question_table: table, question_id: row.id, reason: 'Low-confidence automatic extraction — please verify.' });
        }
      }
    }

    await admin.from('import_jobs').update({
      status: 'done', finished_at: new Date().toISOString(),
      questions_extracted: parsed.length, questions_imported: imported, duplicates, needs_review_count: needsReview,
    }).eq('id', job.id);

    return json({ job_id: job.id, extracted: parsed.length, imported, duplicates, needsReview });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
async function sha256(buf: ArrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function extractPdfText(buf: ArrayBuffer): Promise<string> {
  const doc = await getDocument({ data: buf }).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(' ') + '\n';
  }
  return text;
}

// Conservative heuristic splitter — tuned for cleanly formatted question sets
// like "12. Question text ... A) ... B) ... C) ... D) ... Answer: B".
// Anything that doesn't clearly match is skipped (never guessed).
function splitSatQuestions(text: string) {
  const out: any[] = [];
  const blocks = text.split(/\n(?=\d{1,3}[.)]\s)/g);
  for (const block of blocks) {
    const m = block.match(/^\d{1,3}[.)]\s*([\s\S]*?)\n?A[.)]\s*(.*?)\nB[.)]\s*(.*?)\nC[.)]\s*(.*?)\nD[.)]\s*(.*?)(?:\n|$)/i);
    if (!m) continue;
    const [, question, a, b, c, d] = m;
    const answerMatch = block.match(/Answer:\s*([A-D])/i);
    out.push({
      section: /\b(algebra|equation|geometry|triangle|function|graph|percent)\b/i.test(question) ? 'math' : 'rw',
      topic: 'Unclassified — verify in Admin/Review',
      question: question.trim(),
      choices: [a, b, c, d].map(s => s.trim()),
      correctIndex: answerMatch ? 'ABCD'.indexOf(answerMatch[1].toUpperCase()) : null,
      explanation: null,
    });
  }
  return out;
}
function splitIeltsContent(text: string) {
  // IELTS passages are long-form prose; we don't try to auto-split questions
  // from arbitrary layouts here — we save the passage text as-is for manual
  // question entry via Admin/Review, rather than guessing question boundaries.
  return [{ title: 'Imported passage', passageText: text.trim() }];
}
