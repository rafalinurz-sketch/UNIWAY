-- Original UNIWAY study material for the Question Bank.
-- These are independent practice questions, not official SAT or IELTS exam items.
-- Safe to run repeatedly: existing IDs are left untouched.

-- Bring the remaining IELTS content tables under the same admin-only edit rules.
drop policy if exists "Admins manage ielts_listening_tests" on public.ielts_listening_tests;
drop policy if exists "Admins manage ielts_listening_questions" on public.ielts_listening_questions;
drop policy if exists "Admins manage ielts_writing_tasks" on public.ielts_writing_tasks;
drop policy if exists "Admins manage ielts_speaking_prompts" on public.ielts_speaking_prompts;
create policy "Admins manage ielts_listening_tests" on public.ielts_listening_tests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage ielts_listening_questions" on public.ielts_listening_questions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage ielts_writing_tasks" on public.ielts_writing_tasks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage ielts_speaking_prompts" on public.ielts_speaking_prompts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.sat_tests (id, title, source_file)
values ('uniway-original-sat-2026', 'UNIWAY Original SAT Practice', 'UNIWAY original practice set')
on conflict (id) do nothing;

insert into public.sat_questions
  (id, test_id, test_title, section, topic, difficulty, question, choices, correct_index, explanation, source_file, needs_review)
values
  ('uw-sat-math-001','uniway-original-sat-2026','UNIWAY Original SAT Practice','math','Linear equations','Easy','If 3x − 7 = 11, what is the value of x?', '["4","6","8","18"]'::jsonb,1,'Add 7 to both sides to get 3x = 18, then divide by 3.','UNIWAY original practice set',false),
  ('uw-sat-math-002','uniway-original-sat-2026','UNIWAY Original SAT Practice','math','Statistics','Easy','The mean of 12, 15, 19, and x is 16. What is x?','["16","18","20","22"]'::jsonb,1,'Four values with mean 16 have a total of 64. The known values sum to 46, so x = 18.','UNIWAY original practice set',false),
  ('uw-sat-math-003','uniway-original-sat-2026','UNIWAY Original SAT Practice','math','Functions','Easy','A function is defined by f(x) = 2x + 3. What is f(5)?','["10","11","13","16"]'::jsonb,2,'Substitute 5 for x: 2(5) + 3 = 13.','UNIWAY original practice set',false),
  ('uw-sat-math-004','uniway-original-sat-2026','UNIWAY Original SAT Practice','math','Quadratics','Medium','Which value is a solution to x² − 9x + 20 = 0?','["2","4","7","10"]'::jsonb,1,'Factor the expression as (x − 4)(x − 5). Its solutions are 4 and 5.','UNIWAY original practice set',false),
  ('uw-sat-math-005','uniway-original-sat-2026','UNIWAY Original SAT Practice','math','Geometry','Easy','A circle has circumference 12π. What is its radius?','["3","6","12","24"]'::jsonb,1,'Circumference is 2πr. Setting 2πr = 12π gives r = 6.','UNIWAY original practice set',false),
  ('uw-sat-math-006','uniway-original-sat-2026','UNIWAY Original SAT Practice','math','Probability','Medium','A bag contains 2 red and 3 blue counters. One counter is drawn, replaced, and a second counter is drawn. What is the probability that both are red?','["2/5","4/25","1/5","2/25"]'::jsonb,1,'With replacement, each draw has probability 2/5 of red. Multiply: (2/5)(2/5) = 4/25.','UNIWAY original practice set',false),
  ('uw-sat-math-007','uniway-original-sat-2026','UNIWAY Original SAT Practice','math','Ratios','Easy','A recipe uses 3 cups of rice for every 5 servings. At the same rate, how many cups are needed for 20 servings?','["8","10","12","15"]'::jsonb,2,'Twenty servings is four times five servings, so multiply 3 cups by 4.','UNIWAY original practice set',false),
  ('uw-sat-math-008','uniway-original-sat-2026','UNIWAY Original SAT Practice','math','Systems of equations','Medium','If x + y = 13 and x − y = 5, what is x?','["4","8","9","18"]'::jsonb,2,'Add the equations to eliminate y: 2x = 18, so x = 9.','UNIWAY original practice set',false),
  ('uw-sat-rw-001','uniway-original-sat-2026','UNIWAY Original SAT Practice','rw','Standard English conventions','Easy','Each of the laboratory samples ___ stored at a constant temperature.','["were","was","have been","are"]'::jsonb,1,'The subject is “each,” which is singular, so the singular verb “was” agrees.','UNIWAY original practice set',false),
  ('uw-sat-rw-002','uniway-original-sat-2026','UNIWAY Original SAT Practice','rw','Vocabulary in context','Medium','The first results were tentative, so the researchers repeated the experiment before drawing a conclusion. As used here, “tentative” most nearly means','["temporary and not yet certain","carefully measured","widely accepted","unusually detailed"]'::jsonb,0,'The researchers repeat the experiment because the early results are not yet certain.','UNIWAY original practice set',false),
  ('uw-sat-rw-003','uniway-original-sat-2026','UNIWAY Original SAT Practice','rw','Transitions','Easy','The coastal garden receives little rain in summer. ___, its native plants survive with minimal irrigation.','["For example","Nevertheless","Similarly","In addition"]'::jsonb,1,'The second sentence contrasts with the expectation that little rain would harm the plants.','UNIWAY original practice set',false),
  ('uw-sat-rw-004','uniway-original-sat-2026','UNIWAY Original SAT Practice','rw','Central ideas','Medium','A study compared two groups of city trees. Trees growing in larger soil beds gained more height over three years, although both groups survived at similar rates. Which choice best states the main idea?','["Larger soil beds were associated with greater tree growth.","Most city trees failed to survive three years.","Soil-bed size had no measurable relationship to trees.","The study measured only the survival rate of trees."]'::jsonb,0,'The passage reports greater height growth in the larger beds and similar survival.','UNIWAY original practice set',false),
  ('uw-sat-rw-005','uniway-original-sat-2026','UNIWAY Original SAT Practice','rw','Command of evidence','Medium','A museum wants evidence that a new evening schedule attracts visitors who could not attend during the day. Which finding most directly supports that claim?','["Most evening visitors reported that work or school prevents them from visiting before 5 p.m.","The museum sold more postcards on weekends.","The evening schedule uses fewer staff members.","Several paintings were moved to a different gallery."]'::jsonb,0,'Those visitor reports directly show that the evening hours serve people unable to attend earlier.','UNIWAY original practice set',false),
  ('uw-sat-rw-006','uniway-original-sat-2026','UNIWAY Original SAT Practice','rw','Text structure','Easy','A passage first describes a problem with measuring urban heat, then explains how researchers used satellite images to address it. How is the passage organized?','["It presents a challenge and then a method for addressing it.","It lists competing explanations and rejects both.","It compares two historical periods without drawing a conclusion.","It gives instructions for building a satellite."]'::jsonb,0,'The passage moves from the measurement problem to the researchers’ response.','UNIWAY original practice set',false),
  ('uw-sat-rw-007','uniway-original-sat-2026','UNIWAY Original SAT Practice','rw','Data interpretation','Medium','A survey found that 48 of 80 students preferred morning study sessions. What percentage of the students preferred morning sessions?','["48%","55%","60%","65%"]'::jsonb,2,'Divide 48 by 80 and multiply by 100: 60%.','UNIWAY original practice set',false),
  ('uw-sat-rw-008','uniway-original-sat-2026','UNIWAY Original SAT Practice','rw','Sentence boundaries','Medium','Which choice correctly joins the two sentences? “The archive digitized its maps. Researchers can now compare changes in city boundaries.”','["The archive digitized its maps, researchers can now compare changes in city boundaries.","The archive digitized its maps; researchers can now compare changes in city boundaries.","The archive digitized its maps researchers, can now compare changes in city boundaries.","The archive digitized its maps: and researchers can now compare changes in city boundaries."]'::jsonb,1,'A semicolon correctly joins two independent clauses without a conjunction.','UNIWAY original practice set',false)
on conflict (id) do nothing;

insert into public.ielts_reading_tests (id, title, source_file)
values ('uniway-original-ielts-2026', 'UNIWAY Original IELTS Reading Practice', 'UNIWAY original practice passage')
on conflict (id) do nothing;

insert into public.ielts_reading_passages (id, test_id, title, text, source_file, needs_review)
values (
  'uw-ielts-reading-001',
  'uniway-original-ielts-2026',
  'Small forests, cooler streets',
  'In many cities, summer heat is not distributed evenly. Streets with little shade and extensive asphalt can become considerably warmer than nearby parks. This difference matters most during heat waves, when high overnight temperatures can prevent buildings and people from cooling down.

Urban planners often respond by planting trees. However, a young tree does not immediately provide the shade of a mature one, and planting alone does not guarantee survival. Roots need enough space, access to water, and soil that allows air to circulate. These conditions can be difficult to provide beneath crowded sidewalks and underground utilities.

Some cities are therefore testing pocket forests: compact groups of native trees and shrubs planted in unused corners, schoolyards, or former parking spaces. A small study in one temperate city compared streets near six pocket forests with similar streets nearby. During the second summer, shaded measurement points near the new plantings were cooler at midday. The difference was smaller in early morning, and the study did not establish that pocket forests alone caused the change. Building shade, wind, and traffic can also affect local readings.

Residents helped select locations and water the seedlings during their first year. Researchers say that this involvement may improve long-term care, although the project did not measure whether participation increased survival. The team plans to repeat its measurements across more neighborhoods and over several years.

Pocket forests are not a substitute for citywide heat planning. Their value may be greatest when they are placed where shade is scarce and when they are combined with reflective roofs, drinking-water points, and reliable public cooling spaces. The researchers recommend treating each planting as a local experiment, publishing the measurements, and adapting the next project to what the data show.',
  'UNIWAY original practice passage',
  false
)
on conflict (id) do nothing;

insert into public.ielts_reading_questions (id, passage_id, type, question, choices, answer, needs_review)
values
  ('uw-ielts-q01','uw-ielts-reading-001','tfng','The passage states that high overnight temperatures can make it harder for people and buildings to cool down.',null,'True',false),
  ('uw-ielts-q02','uw-ielts-reading-001','tfng','The study found that the new plantings produced the same temperature difference at every time of day.',null,'False',false),
  ('uw-ielts-q03','uw-ielts-reading-001','tfng','The project measured whether resident participation improved seedling survival.',null,'Not Given',false),
  ('uw-ielts-q04','uw-ielts-reading-001','mcq','Why can planting a tree beneath a crowded sidewalk be difficult?','["There may be limited space and competing underground utilities.","Native trees cannot grow in cities.","Trees need no access to water.","Sidewalks are always cooler than parks."]'::jsonb,'0',false),
  ('uw-ielts-q05','uw-ielts-reading-001','mcq','What did the small study observe during its second summer?','["All nearby streets were cooler at every hour.","Midday readings at shaded points near the plantings were cooler.","Traffic stopped completely near the forests.","The trees survived without water."]'::jsonb,'1',false),
  ('uw-ielts-q06','uw-ielts-reading-001','short','Name one factor, other than pocket forests, that can affect local temperature readings. Accept: building shade, wind, or traffic.','[]'::jsonb,'building shade|wind|traffic',false),
  ('uw-ielts-q07','uw-ielts-reading-001','tfng','The researchers recommend using pocket forests as the only response to urban heat.',null,'False',false),
  ('uw-ielts-q08','uw-ielts-reading-001','short','When did residents help water the seedlings? Accept: during their first year.','[]'::jsonb,'during their first year|first year',false)
on conflict (id) do nothing;

insert into public.ielts_writing_tasks (id, task_type, title, prompt, source_file, needs_review)
values
  ('uw-ielts-writing-t1-001','task1','A changing commute',E'The table below shows the percentage of commuters using three forms of transport in a town in 2010 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\n2010: car 62%, bus 24%, bicycle 14%.\n2025: car 48%, bus 30%, bicycle 22%.','UNIWAY original practice tasks',false),
  ('uw-ielts-writing-t1-002','task1','Library visits across the year',E'The line graph shows monthly visits to a public library, in thousands. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nJanuary 8, March 10, May 14, July 18, September 13, November 9.','UNIWAY original practice tasks',false),
  ('uw-ielts-writing-t2-001','task2','Learning beyond the classroom','Some people believe that university students should spend more time gaining practical work experience than studying academic theory. To what extent do you agree or disagree? Give reasons for your answer and include relevant examples.','UNIWAY original practice tasks',false),
  ('uw-ielts-writing-t2-002','task2','Public transport investment','Many cities are investing in public transport instead of building more roads. Do the advantages of this approach outweigh the disadvantages? Give reasons for your answer and include relevant examples.','UNIWAY original practice tasks',false)
on conflict (id) do nothing;

insert into public.ielts_speaking_prompts (id, part, prompt, source_file, needs_review)
values
  ('uw-ielts-speaking-p1-001','Part 1','What do you like most about the place where you live?','UNIWAY original practice prompts',false),
  ('uw-ielts-speaking-p1-002','Part 1','How do you usually organise your study time?','UNIWAY original practice prompts',false),
  ('uw-ielts-speaking-p1-003','Part 1','Do you prefer studying alone or with other people? Why?','UNIWAY original practice prompts',false),
  ('uw-ielts-speaking-p2-001','Part 2','Describe a skill you learned that was useful to you. You should say what the skill was, how you learned it, how long it took, and explain why it was useful.','UNIWAY original practice prompts',false),
  ('uw-ielts-speaking-p2-002','Part 2','Describe a place in your community where people can learn something new. You should say where it is, what people learn there, who uses it, and explain why it is valuable.','UNIWAY original practice prompts',false),
  ('uw-ielts-speaking-p3-001','Part 3','How has technology changed the way people learn new skills?','UNIWAY original practice prompts',false),
  ('uw-ielts-speaking-p3-002','Part 3','Should governments provide free cultural and educational activities? Why or why not?','UNIWAY original practice prompts',false),
  ('uw-ielts-speaking-p3-003','Part 3','What makes a city comfortable for people of different ages?','UNIWAY original practice prompts',false)
on conflict (id) do nothing;

-- Student writing drafts and optional AI feedback belong only to their author.
create table if not exists public.ielts_writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null references public.ielts_writing_tasks(id) on delete cascade,
  body text not null default '',
  feedback jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, task_id)
);
alter table public.ielts_writing_submissions enable row level security;
drop policy if exists "Owner manages IELTS writing submissions" on public.ielts_writing_submissions;
create policy "Owner manages IELTS writing submissions" on public.ielts_writing_submissions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
