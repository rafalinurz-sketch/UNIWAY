# Uniway — Deep Space Theme + расширенный функционал

Код в этом архиве реализует все 4 запрошенных блока поверх стека
**Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Recharts**.

## ⚠️ Важно про деплой

Я не могу задеплоить это на ваш Vercel-аккаунт напрямую — у меня нет доступа
к вашему GitHub/Vercel и нет сети для этого из данной среды. Но подключить
проект — 5 минут (шаги ниже). Это тот же процесс, каким наверняка деплоился
исходный `uniway-site.vercel.app`.

## Структура проекта

```
uniway/
├── app/
│   ├── globals.css              # Deep Space токены, glass-panel, скроллбар
│   ├── layout.tsx                # подключает шрифты + StarfieldCanvas фон
│   ├── admin/page.tsx             # пример страницы админки
│   ├── universities/page.tsx      # пример страницы подбора вузов
│   └── api/ielts/grade/route.ts   # API route → AI-оценка IELTS
├── components/
│   ├── background/StarfieldCanvas.tsx   # звёзды + кометы (Canvas)
│   ├── ui/GlassCard.tsx, GlowButton.tsx # дизайн-система
│   ├── sat/SatSimulator.tsx             # Bluebook-style симулятор
│   ├── sat/DesmosCalculator.tsx         # калькулятор для Math-модуля
│   ├── ielts/IeltsSubmission.tsx        # форма Writing/Speaking + AI-оценка
│   ├── flashcards/FlashcardGenerator.tsx
│   ├── universities/ChanceCalculator.tsx # Safety/Target/Reach
│   ├── universities/UniversityCard.tsx
│   ├── admin/AdminDashboard.tsx          # графики Recharts
│   ├── admin/UsersTable.tsx
│   └── admin/ContentBuilder.tsx          # CRUD вопросов SAT
├── lib/
│   ├── chance-calculator.ts     # эвристика Safety/Target/Reach
│   └── ielts-grading.ts         # серверный вызов AI API (Claude)
├── types/
│   ├── sat.ts, ielts.ts, university.ts
├── data/universities.sample.json
├── tailwind.config.ts           # цвета/тени/анимации Deep Space
└── .env.example
```

## Архитектурные решения по каждому блоку

**1. Дизайн.** Токены темы вынесены в `tailwind.config.ts` (цвета `space.*`,
`accent.*`, тени `shadow-glow-*`) и `app/globals.css` (классы `.glass-panel`,
`.glass-panel--aurora`). `StarfieldCanvas` рисует звёзды и кометы на
`<canvas>` — это на порядок дешевле по производительности, чем сотни
DOM-элементов, и уважает `prefers-reduced-motion`.

**2. SAT/IELTS.** `SatSimulator` — контролируемый компонент с состоянием
попытки (`SatAttemptState`): ответы, статусы вопросов, таймер. Это позволяет
как показывать прогресс в реальном времени, так и сохранять черновик попытки
на сервер по интервалу (добавьте `useEffect` с `fetch` на автосохранение).
`IeltsSubmission` разделяет **клиентскую** часть (запись аудио через
`MediaRecorder`, textarea для эссе) и **серверную** (`lib/ielts-grading.ts`)
— так секретный `ANTHROPIC_API_KEY` никогда не попадает в браузер.

**3. Университеты.** Схема `University` в `types/university.ts` покрывает все
поля из ТЗ; в комментарии там же — готовая Prisma-модель для миграции в
Postgres/Supabase. `calculateChance` — прозрачная объяснимая эвристика
(не чёрный ящик): каждое сравнение балла с минимумом вуза даёт понятную
причину в `reasoning[]`, которую можно показать пользователю.

**4. Админка.** `AdminDashboard` ожидает данные в форме `DashboardStats` —
подключите реальные агрегации (например, через Prisma `groupBy`/`count`) в
серверном компоненте `app/admin/page.tsx` вместо `mockStats`. `UsersTable` и
`ContentBuilder` — управляемые формы с колбэками (`onResetPassword`,
`onSaveQuestion` и т.д.), которые вы подключаете к своим API-роутам/server actions.

## Как это связать с вашим текущим uniway-site.vercel.app

1. Если исходный сайт уже на Next.js — скопируйте папки `app/`, `components/`,
   `lib/`, `types/`, `data/` поверх существующих (или в соответствующие пути
   вашей структуры), сравните и смёрджите `tailwind.config.ts`.
2. Если стек другой (например, чистый React/Vite или другой фреймворк) —
   логика компонентов (JSX + hooks) переносится почти один в один, но роутинг
   и файловую структуру (`app/api/...`) нужно адаптировать под ваш роутер.
3. Установите зависимости из `package.json` (`npm install`).
4. Заполните `.env` по образцу `.env.example` (ключ Anthropic API для IELTS,
   `DATABASE_URL` для БД вузов/пользователей).

## Деплой на Vercel (то, что я не могу сделать за вас)

1. Запушьте проект в GitHub-репозиторий (`git init && git add . && git commit -m "Deep Space redesign" && git push`).
2. На [vercel.com](https://vercel.com) → **Add New Project** → выберите этот репозиторий.
3. В **Environment Variables** добавьте переменные из `.env.example`
   (как минимум `ANTHROPIC_API_KEY`, если хотите живую AI-оценку IELTS).
4. Нажмите **Deploy** — Vercel сам определит Next.js и настроит билд.
5. Если это обновление существующего проекта `uniway-site` — просто запушьте
   в ту же ветку/репозиторий, который уже подключён к Vercel: деплой запустится
   автоматически, и ссылка `uniway-site.vercel.app` останется прежней.

## Что ещё стоит доделать перед продакшеном

- Аутентификация и роли (NextAuth/Supabase Auth) — компоненты уже рассчитаны
  на `userId`/`role`, но сам провайдер входа не входит в этот код.
- Реальное хранилище аудио Speaking-ответов (Supabase Storage/S3) —
  `/api/uploads/audio` сейчас точка расширения, не реализована.
- STT (речь → текст) для Speaking перед отправкой в AI-оценку.
- Реальные API-роуты для `onSaveQuestion`, `onResetPassword`, `onChangeRole` —
  сейчас это колбэки-заглушки под ваш backend/Prisma.
