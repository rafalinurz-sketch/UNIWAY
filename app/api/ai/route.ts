import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Single shared AI endpoint for the AI Advisor, essay feedback, study-plan
 * generation and IELTS speaking feedback. Server-side only, so the API key
 * never reaches the browser.
 *
 * If ANTHROPIC_API_KEY is not set, this returns a clear, honest message
 * instead of a fabricated response — the calling components must display
 * that message as-is rather than pretending the AI answered.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { prompt?: unknown } | null;
  if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
    return NextResponse.json({ connected: false, error: true, text: "Enter a question or draft to continue." }, { status: 400 });
  }
  if (body.prompt.length > 6000) {
    return NextResponse.json({ connected: false, error: true, text: "This request is too long. Shorten it and try again." }, { status: 413 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        connected: false,
        text: "AI is not connected yet — add ANTHROPIC_API_KEY in your environment variables (Vercel → Project → Settings → Environment Variables) to enable real AI responses here.",
      },
      { status: 200 }
    );
  }

  const supabase = createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return NextResponse.json({ connected: true, error: true, text: "Sign in to use the AI assistant." }, { status: 401 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: body.prompt.trim() }],
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ connected: true, error: true, text: `AI request failed (${res.status}). Please try again later.` }, { status: 502 });
    }
    const data = await res.json();
    const text = data.content?.map((c: { text?: string }) => c.text ?? "").join("\n") ?? "";
    return NextResponse.json({ connected: true, text });
  } catch (e) {
    return NextResponse.json({ connected: true, error: true, text: "AI request failed. Please try again later." }, { status: 502 });
  }
}
