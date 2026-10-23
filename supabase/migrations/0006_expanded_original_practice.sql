-- UNIWAY original practice expansion: 100 SAT Math questions and 20 IELTS tasks.
-- Generated variants use distinct values and checked answer choices; no official exam items.
do $$
declare
  i int;
  family int;
  a int;
  b int;
  c int;
  x int;
  base_value int;
  percent_value int;
  correct_value int;
  parts int;
  total_value int;
  idx int;
  correct_text text;
  explanation_text text;
  prompt_text text;
  topic_text text;
  option_values text[];
  choices_json jsonb;
  j int;
begin
  for family in 1..5 loop
    for i in 1..20 loop
      idx := (i + family) % 4;
      if family = 1 then
        x := i + 3;
        a := (i % 5) + 2;
        b := (i % 9) + 2;
        c := a * x + b;
        correct_value := x;
        topic_text := 'Linear equations';
        prompt_text := format('A delivery service charges a fixed fee of %s dollars plus %s dollars per package. A customer pays %s dollars. How many packages were delivered?', b, a, c);
        explanation_text := format('Let n be the number of packages. Solve %s + %s n = %s: subtract %s, then divide by %s. Thus n = %s.', b, a, c, b, a, x);
      elsif family = 2 then
        base_value := 120 + i * 20;
        percent_value := 10 + (i % 5) * 10;
        correct_value := base_value * (100 - percent_value) / 100;
        topic_text := 'Percentages';
        prompt_text := format('A jacket originally costs $%s and is discounted by %s%%. What is its sale price before tax?', base_value, percent_value);
        explanation_text := format('The sale price is %s%% of $%s: %s × %s / 100 = $%s.', 100-percent_value, base_value, base_value, 100-percent_value, correct_value);
      elsif family = 3 then
        a := 5 + i;
        b := a + 2;
        c := a - 1;
        correct_value := 5 * a - a - b - c - (a + 4);
        topic_text := 'Mean and averages';
        prompt_text := format('The mean of five numbers is %s. Four of the numbers are %s, %s, %s, and %s. What is the fifth number?', a, a, b, c, a+4);
        explanation_text := format('The five numbers must total 5 × %s = %s. The four known numbers total %s, so the missing number is %s.', a, 5*a, a+b+c+(a+4), correct_value);
      elsif family = 4 then
        a := 2 + (i % 4);
        b := 3 + (i % 3);
        parts := 3 + (i % 6);
        total_value := (a + b) * parts;
        correct_value := a * parts;
        topic_text := 'Ratios';
        prompt_text := format('A box contains red and blue tiles in a ratio of %s:%s. If there are %s tiles altogether, how many are red?', a, b, total_value);
        explanation_text := format('There are %s equal ratio parts in total. Each part is %s ÷ %s = %s tiles, so the red group has %s × %s = %s tiles.', a+b, total_value, a+b, parts, a, parts, correct_value);
      else
        a := 2 + (i % 7);
        b := 3 + (i % 5);
        total_value := a + b;
        correct_value := a;
        topic_text := 'Probability';
        prompt_text := format('A bag contains %s red counters and %s blue counters. One counter is selected at random. What is the probability that it is red?', a, b);
        explanation_text := format('There are %s red counters out of %s counters in total, so the probability is %s/%s.', a, total_value, a, total_value);
        option_values := array[format('%s/%s',a,total_value), '1/1', format('0/%s',total_value), format('1/%s',total_value)];
      end if;

      if family <> 5 then
        correct_text := correct_value::text;
        option_values := array[correct_text, (correct_value+3)::text, (correct_value-2)::text, (correct_value+7)::text];
      end if;
      choices_json := '[]'::jsonb;
      for j in 0..3 loop
        choices_json := choices_json || jsonb_build_array(option_values[((j-idx+4)%4)+1]);
      end loop;
      insert into public.sat_questions (id, test_id, section, topic, difficulty, question, choices, correct_index, explanation, source_file, needs_review)
      values (format('uw-sat-exp-%s-%s', family, lpad(i::text, 3, '0')), 'uniway-original-sat-2026', 'math', topic_text,
        case when i % 3 = 0 then 'Hard' when i % 3 = 1 then 'Easy' else 'Medium' end,
        prompt_text, choices_json, idx, explanation_text, 'UNIWAY original practice expansion', false)
      on conflict (id) do nothing;
    end loop;
  end loop;
end $$;

insert into public.ielts_reading_passages (id, test_id, title, text, source_file, needs_review)
values
 ('uw-ielts-exp-r1','uniway-original-ielts-2026','Repair cafés and the circular economy',
  'In many towns, a broken lamp or jacket is discarded because replacing it seems quicker than finding a repair service. Repair cafés offer another option. At these volunteer events, residents bring household objects and work alongside people with practical skills. The goal is not simply to provide a free repair: visitors are encouraged to observe the process and learn how to maintain their belongings.

The events also create a place for people to meet. Organisers say that conversations often continue after a repair is finished, and some visitors later return as volunteers. This social benefit can be as important to participants as the repaired object. However, the model has limits. A café may not have the specialist tools needed for every item, and electrical repairs require careful safety checks. Organisers therefore ask volunteers to refuse jobs that fall outside their experience.

Researchers studying several community repair events found that the number of objects repaired varied considerably from one event to another. They cautioned against using repair totals alone to judge success. A small event may teach many visitors useful skills, while a larger event may repair more objects but have fewer opportunities for one-to-one learning. The researchers recommend recording both the environmental outcome and the educational experience.

Some local councils now provide rooms or small grants to help these groups meet. This support can reduce costs, but organisers still rely on volunteers and donated tools. Their long-term success depends on making events welcoming, safe, and easy to find.', 'UNIWAY original IELTS reading', false),
 ('uw-ielts-exp-r2','uniway-original-ielts-2026','Restoring wetlands upstream',
  'Wetlands can store water, support wildlife, and slow the movement of floodwater. Yet many were drained in the past to create farmland or make space for construction. Several regions are now restoring selected wetlands, but the work involves more than simply blocking a ditch. Specialists first study the ground level, water flow, and plants that remain in the area.

One restoration programme began by mapping seasonal water levels across a river valley. The team found that some low areas still flooded naturally, while other sections had been disconnected from the river by raised banks. In the disconnected areas, engineers created shallow channels that allowed water to enter during high flows. Native plants were introduced only after water conditions had begun to recover.

The programme did not measure success by the number of plants alone. Researchers also monitored how long water remained on the land, the variety of insects, and the number of bird species recorded during regular surveys. These measures changed at different speeds. Water patterns responded in the first year, while some wildlife indicators took longer to show a clear trend.

Local farmers were invited to planning meetings because restoration could affect nearby fields and access routes. In some locations, agreements were reached to keep paths open and compensate owners when planned water storage affected productive land. The project team says clear communication helped build trust, although it could not remove every concern.

Restoration cannot recreate every feature of a historic wetland. Land use around a site may have changed permanently, and a warmer climate can alter rainfall. The team therefore describes its work as improving the functions of a landscape under current conditions, rather than returning it to an exact past state.', 'UNIWAY original IELTS reading', false)
on conflict (id) do nothing;

insert into public.ielts_reading_questions (id, passage_id, type, question, choices, answer, needs_review)
values
 ('uw-ielts-exp-r1-q1','uw-ielts-exp-r1','mcq','What is one purpose of a repair café besides fixing objects?','["To help visitors learn basic maintenance skills","To sell replacement products","To provide professional certification","To collect household waste"]'::jsonb,'0',false),
 ('uw-ielts-exp-r1-q2','uw-ielts-exp-r1','mcq','Why might a volunteer refuse to repair an item?','["The visitor arrived late","The repair could be unsafe or outside the volunteer’s skills","The object is less than one year old","The café has already repaired that model"]'::jsonb,'1',false),
 ('uw-ielts-exp-r1-q3','uw-ielts-exp-r1','mcq','What do the researchers recommend measuring?','["Only the number of volunteers","Both environmental results and learning","The cost of every donated tool","The age of repaired objects"]'::jsonb,'1',false),
 ('uw-ielts-exp-r1-q4','uw-ielts-exp-r1','tfng','All repair cafés have the same number of repaired objects at each event.',null,'False',false),
 ('uw-ielts-exp-r1-q5','uw-ielts-exp-r1','tfng','Some visitors later become volunteers.',null,'True',false),
 ('uw-ielts-exp-r1-q6','uw-ielts-exp-r1','mcq','What support do some councils provide?','["A guarantee that every object will be repaired","Rooms or small grants","Full-time professional repair staff","Free replacement appliances"]'::jsonb,'1',false),
 ('uw-ielts-exp-r2-q1','uw-ielts-exp-r2','mcq','What did specialists examine before restoration work began?','["Ground levels, water flow, and existing plants","The price of nearby houses","The age of all local farms","The number of visitors to the valley"]'::jsonb,'0',false),
 ('uw-ielts-exp-r2-q2','uw-ielts-exp-r2','mcq','What was built in some disconnected parts of the valley?','["Raised roads","Shallow channels","New farm buildings","Deep drainage ditches"]'::jsonb,'1',false),
 ('uw-ielts-exp-r2-q3','uw-ielts-exp-r2','mcq','Which change was observed first?','["A clear increase in every bird species","Changes in water patterns","More farming activity","The return of all historic plants"]'::jsonb,'1',false),
 ('uw-ielts-exp-r2-q4','uw-ielts-exp-r2','tfng','The team measured success only by counting plants.',null,'False',false),
 ('uw-ielts-exp-r2-q5','uw-ielts-exp-r2','mcq','Why were local farmers invited to meetings?','["Restoration could affect fields and access routes","They were responsible for all engineering work","They had already agreed to stop farming","The project needed them to survey birds"]'::jsonb,'0',false),
 ('uw-ielts-exp-r2-q6','uw-ielts-exp-r2','tfng','The team claims that restoration can recreate every detail of a historic wetland.',null,'False',false)
on conflict (id) do nothing;

insert into public.ielts_writing_tasks (id, task_type, title, prompt, source_file, needs_review)
values
 ('uw-ielts-exp-w1','task1','Household energy use','The chart below shows the proportion of household energy used for heating, appliances, lighting, and water in a country in 2000 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. 2000: heating 52%, appliances 24%, water 16%, lighting 8%. 2025: heating 41%, appliances 31%, water 19%, lighting 9%.','UNIWAY original practice tasks',false),
 ('uw-ielts-exp-w2','task1','Visitors to three galleries','The table shows annual visitors, in thousands, to three galleries in 2015 and 2025. Summarise the information and make comparisons where relevant. North Gallery: 240 and 310; City Gallery: 180 and 175; Modern Arts Centre: 120 and 205.','UNIWAY original practice tasks',false),
 ('uw-ielts-exp-w3','task1','A community garden process','The diagram illustrates how a community garden turns food waste into compost and uses it to grow vegetables. Summarise the process by selecting and reporting the main stages. Include collection, sorting, decomposition, soil preparation, planting, and harvesting.','UNIWAY original practice tasks',false),
 ('uw-ielts-exp-w4','task1','International student enrolments','The graph shows international student enrolments at a college from 2018 to 2023: 420, 460, 510, 390, 570, and 640. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.','UNIWAY original practice tasks',false),
 ('uw-ielts-exp-w5','task2','Public libraries in a digital age','Some people think public libraries are no longer necessary because information is available online. To what extent do you agree or disagree? Give reasons and examples.','UNIWAY original practice tasks',false),
 ('uw-ielts-exp-w6','task2','Learning a second language','Some schools require students to learn a second language from an early age. What are the advantages and disadvantages of this policy?','UNIWAY original practice tasks',false),
 ('uw-ielts-exp-w7','task2','Urban green spaces','Parks and green spaces should receive the same investment priority as roads and public transport. To what extent do you agree or disagree?','UNIWAY original practice tasks',false),
 ('uw-ielts-exp-w8','task2','Remote work and cities','Working from home is becoming more common. What effects might this have on workers and the cities where they live?','UNIWAY original practice tasks',false)
on conflict (id) do nothing;

insert into public.ielts_speaking_prompts (id, part, prompt, source_file, needs_review)
values
 ('uw-ielts-exp-s1','Part 1','What kind of place do you like to study in?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s2','Part 1','How often do you use public transport?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s3','Part 1','Do you enjoy cooking or preparing food? Why?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s4','Part 1','What do you usually do when you have a free afternoon?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s5','Part 1','Is there a subject you would like to learn in the future?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s6','Part 2','Describe a time you worked with other people to complete a task. Say what the task was, who you worked with, what you did, and what you learned from the experience.','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s7','Part 2','Describe a public place you enjoy visiting. Say where it is, when you go there, what people do there, and explain why you like it.','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s8','Part 2','Describe something useful you learned from a family member or friend. Say what it was, who taught you, how you use it, and explain why it is useful.','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s9','Part 2','Describe a goal you achieved after making a plan. Say what the goal was, how you planned, what challenges you faced, and how you felt when you achieved it.','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s10','Part 2','Describe a book, article, or video that taught you something new. Say what it was, when you found it, what you learned, and why it was memorable.','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s11','Part 3','How can schools help students develop the ability to work in teams?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s12','Part 3','What responsibilities do cities have for making public spaces accessible?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s13','Part 3','Why do some people prefer learning from videos while others prefer books?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s14','Part 3','How has online communication changed friendships?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s15','Part 3','Should young people be encouraged to take part in local community projects? Why?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s16','Part 3','What can employers do to support staff who want to continue studying?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s17','Part 3','How might transport choices in cities change over the next twenty years?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s18','Part 3','Do people today have more opportunities to learn than previous generations?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s19','Part 3','Why is it important for communities to preserve local traditions?','UNIWAY original practice prompts',false),
 ('uw-ielts-exp-s20','Part 3','How can individuals reduce waste in their everyday lives?','UNIWAY original practice prompts',false)
on conflict (id) do nothing;
