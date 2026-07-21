## Request 1

Goal: Сгенерировать AGENTS.md с инструкциями для AI-сессий на основе ТЗ и клиентского контента

Prompt: 0 — генерация AGENTS.md

Изучи TASK.md, 04-fullstack-task-spec.md и 04-fullstack-client-content.md в папке docs/ и на их основе составь AGENTS.md с инструкциями для будущих агентных сессий: обязательный стек, структура репозитория (frontend FSD + backend NestJS), что реализуется по-настоящему, а что как mock, доменная модель, формула калькулятора, полный flow заявка → займ → подписание → график → платежи, роли admin/operator, DoD-чеклист, формат AI_USAGE.md.

Result: Создан docs/AGENTS.md (19 разделов: стек, структура, доменная модель, server/client components, аутентификация, калькулятор, flow заявки, личный кабинет, админ-панель, юридические страницы, DoD, формат AI_USAGE.md, правила коммитов и т.д.)

Used as-is / edited manually / rejected: edited manually

What I learned: Клиентский текст и ТЗ содержат противоречия (бизнес-заявки, ставка, график) — их нужно фиксировать отдельным пунктом в AGENTS.md, чтобы AI не додумывал

Model used: Claude Sonnet 5

Instrument used: Claude.ai

## Request 2

Goal: Создать структуру репозитория — пустые директории frontend/ и backend/ по FSD и NestJS-схеме + .gitignore

Prompt: 1.1 — структура репозитория

Создай в корне папки frontend/ и backend/ (docs/ уже есть). На этом шаге больше ничего не инициализируй — только структура каталогов. Также добавь .gitignore в корне проекта

Result: Созданы пустые директории: frontend/src/{app,pages,widgets,features,entities,shared/{api,ui,lib,config}} и backend/src/{modules/{auth,admin-auth,applications,loans,payments,payment-requests,notifications,clients,calculator,files,contact-messages},common,prisma}. Добавлен .gitignore с правилами для Node.js, NestJS, Next.js, .env, coverage, .DS_Store, minio-data/.

Used as-is / edited manually / rejected: used as-is

What I learned: Структура полностью соответствует AGENTS.md п.4 — ничего не пришлось менять

Model used: big-pickle

Instrument used: OpenCode

## Request 3

Goal: Инициализировать backend (NestJS) с TypeScript, настроить .env, CORS и добавить GET /health

Prompt: 1.2 — инициализация backend (NestJS)

Инициализируй в backend/ проект NestJS на TypeScript. Настрой .env/.env.example (порт, URL базы данных, секрет JWT). Настрой CORS для локальной разработки (origin фронтенда — из env). Добавь GET /health. Бизнес-модули на этом шаге не создавай.

Result: Инициализирован NestJS проект: package.json, tsconfig.json, tsconfig.build.json, nest-cli.json, .prettierrc, eslint.config.mjs. Настроен .env/.env.example с переменными PORT, DATABASE_URL, JWT_SECRET, FRONTEND_URL. В main.ts добавлены CORS (с configurable origin), ValidationPipe. Создан GET /health endpoint с AppService (возвращает { status: 'ok', timestamp }). Добавлен @nestjs/config для загрузки env переменных. Восстановлены app.service.ts и app.controller.spec.ts. npm run build проходит успешно.

Used as-is / edited manually / rejected: edited manually

What I learned: Не удалять стандартные NestJS-файлы (app.service, app.controller.spec) — они могут понадобиться позже для логики и тестов.

Model used: big-pickle

Instrument used: OpenCode