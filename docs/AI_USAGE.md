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

## Request 4

Goal: Добавить PostgreSQL через docker-compose и инициализировать Prisma ORM

Prompt: 1.3 — PostgreSQL и ORM

Добавь backend/docker-compose.yml с сервисом PostgreSQL (порт, volume, переменные из .env). Инициализируй ORM (Prisma) с подключением к БД через переменную окружения. Схему сущностей не описывай — только подключение, проверь что миграция на пустой схеме отрабатывает без ошибок.

Result: Создан backend/docker-compose.yml с сервисом PostgreSQL 16-alpine (порт 5432, volume postgres-data, healthcheck). Инициализирован Prisma v7.9.0: prisma/schema.prisma (пустая схема с postgresql), prisma.config.ts (datasource.url из env("DATABASE_URL")), PrismaService и PrismaModule в src/prisma/. Добавлены prisma и @prisma/client в зависимости, dotenv для .env. npm run build проходит, prisma migrate dev и prisma generate работают. PostgreSQL запускается через docker compose up -d.

Used as-is / edited manually / rejected: edited manually

What I learned: Prisma v7 перенесла url из schema.prisma в prisma.config.ts — нужно использовать defineConfig и env() из prisma/config. dotenv не поддерживает shell-style интерполяцию ${VAR} в .env файлах — нужно прописывать значения напрямую. Нужно убедиться, что prisma и @prisma/client установлены как зависимости, а не через npx.

Model used: big-pickle

Instrument used: OpenCode

## Request 5

Goal: Инициализировать frontend (Next.js + Tailwind CSS v4) с FSD-структурой

Prompt: 1.4 — инициализация frontend (Next.js + FSD)

Инициализируй в frontend/ проект Next.js (App Router, TypeScript, --src-dir). Подключи Tailwind CSS v4. Создай структуру Feature-Sliced Design внутри src/: app/, pages/, widgets/, features/, entities/, shared/{api,ui,lib,config}. Только структура и заглушки, без бизнес-компонентов.

Result: Инициализирован Next.js 16.2.10 с TypeScript, App Router, --src-dir. Подключена Tailwind CSS v4 через @tailwindcss/postcss (postcss.config.mjs, globals.css с @import "tailwindcss" и @theme inline). Создана FSD-структура: src/{app,pages,widgets,features,entities,shared/{api,ui,lib,config}} с .gitkeep файлами. npm run build проходит успешно (Turbopack).

Used as-is / edited manually / rejected: used as-is

What I learned: Next.js 16 использует Turbopack по умолчанию для build. Tailwind CSS v4 работает через @tailwindcss/postcss плагин и использует @import "tailwindcss" вместо @tailwind directives. FSD-структура совместима с App Router — pages/ слой существует для организации compositions, но роутинг идёт через app/.

Model used: big-pickle

Instrument used: OpenCode

## Request 6

Goal: Реализовать модуль файлового хранилища (S3-совместимое, MinIO) с эндпоинтом загрузки

Prompt: 1.5 — backend: файловое хранилище (S3-совместимое)

Реализуй modules/files: подключение S3-совместимого клиента (MinIO для локальной разработки) через переменные окружения (endpoint, bucket, ключи). Добавь POST /files/upload (multipart, ограничение размера и допустимых типов — pdf/jpg/png), который кладёт файл в bucket и создаёт запись FileAttachment (ownerType, ownerId нужно передавать отдельным вызовом или как query — реши на своё усмотрение и зафиксируй в AI_USAGE.md), возвращает id и ссылку на файл. Добавь MinIO в backend/docker-compose.yml (порт, volume, переменные из .env). Бизнес-модули, которые используют файлы (applications, contact-messages), подключаются к этому эндпоинту в следующих шагах.

Result: Создан modules/files: files.module.ts, files.service.ts, files.controller.ts. FilesService использует @aws-sdk/client-s3 и @aws-sdk/s3-request-presigner для работы с MinIO. POST /files/upload принимает multipart/form-data с полем 'file', ограничение 10MB, допустимые типы: pdf/jpg/png. OwnerType/ownerId передаются как query parameters (?ownerType=application&ownerId=xxx). Создана модель FileAttachment в Prisma schema с миграцией. Добавлен MinIO в docker-compose.yml (порт 9000/9001, volume minio-data). Обновлены .env/.env.example с S3 переменными. FilesModule добавлен в AppModule. npm run build проходит успешно.

Used as-is / edited manually / rejected: used as-is

What I learned: OwnerType/ownerId лучше передавать как query parameters — это проще для интеграции с фронтендом (можно добавить к URL загрузки) и не требует отдельного вызова для привязки файла. Важно использовать forcePathStyle: true для MinIO (S3-совместимые хранилища). Нужно добавить FileAttachment модель в Prisma schema до написания сервиса, иначе TypeScript будет ругаться на отсутствующие методы.

Model used: big-pickle

Instrument used: OpenCode

## Request 7

Goal: Описать в Prisma schema модели User, OtpCode, AdminUser

Prompt: 2.1 — схема БД: User, OtpCode, AdminUser

Опиши в схеме ORM модели User (id, phone уникальный, name, createdAt), OtpCode (id, phone/userId, code, purpose: login | sign-loan, expiresAt, usedAt), AdminUser (id, login уникальный, passwordHash, role: admin | operator, createdAt). Без миграции.

Result: Добавлены модели User, OtpCode, AdminUser в prisma/schema.prisma. User — id, phone (unique), name?, createdAt. OtpCode — id, phone, userId?, code, purpose (login|sign-loan), expiresAt, usedAt?, createdAt; индексы по [phone, purpose] и [userId]. AdminUser — id, login (unique), passwordHash, role (admin|operator), createdAt. Связи с другими моделями (Application, Loan и т.д.) не добавлены — они появятся в следующих шагах. npx prisma validate проходит успешно.

Used as-is / edited manually / rejected: edited manually

What I learned: Нельзя добавлять связи на модели, которых ещё нет в schema — Prisma validate упадёт с ошибкой. Связи нужно добавлять по мере создания каждой модели, либо добавлять все модели за один раз.

Model used: big-pickle

Instrument used: OpenCode

## Request 8

Goal: Добавить модель Application в Prisma schema с полями для физлиц и бизнеса

Prompt: 2.2 — схема БД: Application

Добавь модель Application (id, userId, applicantType: individual | business, поля физлица/бизнеса из клиентского текста, amount, termDays, status: new | in_progress | approved | rejected, comment опционально, createdAt), связь на User.

Result: Добавлена модель Application в prisma/schema.prisma. Поля: id, userId, applicantType (individual|business), amount, termDays, status (new|in_progress|approved|rejected, default new), comment?, createdAt. Поля для физлиц: firstName?, lastName?, email?. Поля для бизнеса: companyName?, registrationNumber?, companyEmail?, companyPhone?. Связь many-to-one с User (userId → User.id). Индексы по [userId] и [status]. Обновлена модель User — добавлены связи applications и otpCodes. npx prisma validate проходит успешно.

Used as-is / edited manually / rejected: used as-is

What I learned: При добавлении модели Application нужно одновременно обновить User модель с обратной связью (applications Application[]). Поля для физлиц/бизнеса сделаны опциональными — обязательность определяется бизнес-логикой в сервисах, а не схемой БД. Связи на Loan и другие модели не добавляются до их создания в Request 9.

Model used: big-pickle

Instrument used: OpenCode