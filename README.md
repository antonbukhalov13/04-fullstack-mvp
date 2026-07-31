# 04-fullstack-mvp

Учебный fullstack MVP финансового сервиса `LumenBridge Finance Ltd`, который принимает онлайн-заявки на краткосрочные займы для физических лиц и малого бизнеса в Европе

Полный путь заявки: расчёт условий в калькуляторе → подача заявки → обработка заявки оператором → одобрение и создание займа → подписание займа через OTP → автоматическое построение графика платежей → заявки пользователя на оплату → ручное подтверждение платежей администратором → пересчёт графика → закрытие займа

Это учебный проект, а не production-банкинг: реальные платёжные интеграции, SMS-провайдер и внешний скоринг заменены локальными mock-сценариями

## Стек

Frontend:
- Next.js 16 (App Router), TypeScript
- Tailwind CSS v4
- React Hook Form + Valibot
- архитектура Feature-Sliced Design (`app/ features/ widgets/ entities/ shared/`)

Backend:
- Node.js, NestJS
- Prisma ORM
- class-validator / class-transformer (серверная валидация)
- Passport JWT (отдельные стратегии для пользователей и админ-панели)
- @nestjs/throttler (rate-limit на login/OTP-эндпоинты)

Хранение данных:
- PostgreSQL (через Prisma)
- MinIO (S3-совместимое хранилище для файлов/документов, поднимается локально)

## Структура проекта

```
backend/
  prisma/
    schema.prisma               # модели: User, AdminUser, OtpCode, Application, Loan,
                                 # PaymentScheduleItem, PaymentRequest, Payment, Notification,
                                 # ContactMessage, FileAttachment, AuditLog
    migrations/                 # история миграций
    seed.ts                     # admin/operator + mock-данные для демонстрации
  src/
    main.ts                     # bootstrap, CORS, ValidationPipe, порт 3001
    app.module.ts               # корневой модуль
    prisma/                     # PrismaService / PrismaModule
    common/
      guards/                   # JwtAuthGuard, AdminJwtAuthGuard, RolesGuard, OptionalJwtAuthGuard
      decorators/               # @CurrentUser, @Roles
    modules/
      auth/                     # вход пользователя: mock SMS OTP (request/verify)
      admin-auth/               # вход администратора/оператора по логину и паролю
      admin-users/              # управление админ-аккаунтами и ролями (только admin)
      calculator/               # аннуитетный расчёт условий займа
      applications/             # заявки: создание, список, статус, комментарии оператора
      loans/                    # займы: подписание через OTP, график, статусы, закрытие
      payment-requests/         # заявки пользователя на оплату
      payments/                 # решение по заявке на оплату, ручная фиксация платежа
      notifications/            # уведомления пользователя и системные уведомления админки
      contact-messages/         # форма обратной связи
      clients/                  # карточка клиента для админ-панели
      files/                    # загрузка/выдача файлов через MinIO (S3 API)
      audit-log/                # журнал действий администраторов/операторов
  docker-compose.yml            # postgres + minio для локального запуска
  package.json
docs/
  AGENTS.md                     # правила для агента
  AI_USAGE.md                   # журнал AI-запросов
  04-fullstack-client-content.md # исходный клиентский текст
  04-fullstack-task-spec.md     # полное ТЗ и критерии приёмки
  PROMPT_PLAN.md                # пошаговый план разработки
  TASK.md                       # краткая сводка задачи
frontend/
  src/
    app/                        # публичные страницы, /login, /apply, /dashboard, /admin
      dashboard/                # личный кабинет: заявки, займы, оплаты, уведомления
      admin/                    # админ-панель: (auth) и (dashboard) сегменты
    features/                   # apply-loan, login-otp, admin-login, admin-*-list и т.д.
    widgets/                    # блоки лендинга, calculator, header/footer, sidebar-ы
    shared/
      api/                      # api-client.ts — обёртка над fetch, токены пользователя/админа
      ui/                       # переиспользуемые UI-компоненты
      lib/calculator.ts         # клиентский расчёт для превью в калькуляторе
  next.config.ts
  package.json
```

## Запуск и подключение

> **О терминалах:** backend и frontend — это долгоживущие процессы (запускаются и продолжают работать, показывая логи, пока их не остановить через `Ctrl+C`). Поэтому их нужно запускать **в разных окнах/вкладках терминала** — пока процесс работает, его терминал занят и не может выполнять другие команды.
>
> Ниже команды сгруппированы по терминалам:
> - **Терминал A** — установка, Docker (Postgres/MinIO), git, миграции и другие разовые команды. Терминал освобождается после каждой команды.
> - **Терминал B** — backend (`npm run start:dev`). Остаётся открытым, показывает логи backend.
> - **Терминал C** — frontend (`npm run dev`). Остаётся открытым, показывает логи frontend.

### Требования

| Инструмент | Зачем | Как проверить |
|---|---|---|
| Git | клонирование репозитория | `git --version` |
| Node.js 20+ (проверено на Node.js 24) | запуск backend и frontend | `node --version` |
| npm (поставляется вместе с Node.js, проверено на npm 11) | установка зависимостей | `npm --version` |
| Docker Engine / Docker Desktop + Compose plugin | PostgreSQL и MinIO запускаются контейнерами | `docker --version` и `docker compose version` |

Если чего-то из этого нет — установите по шагам ниже, затем перезапустите терминал.

### 1. Установка необходимого ПО

Подойдёт почти любой способ установки; ниже — самый простой вариант для каждой ОС. После установки перезапустите терминал и проверьте команду из таблицы «Требования».

#### Git

**Windows:** скачайте установщик с https://git-scm.com/downloads и пройдите установку, оставляя все значения по умолчанию (кнопка Next).

**macOS:** выполните `xcode-select --install` или скачайте установщик с https://git-scm.com/download/mac.

**Linux (Debian/Ubuntu):** `sudo apt update && sudo apt install -y git`

Проверка: `git --version`

#### Node.js и npm

Скачайте **LTS**-версию (20 или новее) с https://nodejs.org — npm устанавливается вместе с Node.js.

**Windows:** установщик `.msi` (далее Next во всех окнах). **macOS:** установщик `.pkg`. **Linux (Debian/Ubuntu):** можно через официальный репозиторий https://github.com/nodesource/distributions или через менеджер версий `nvm` (https://github.com/nvm-sh/nvm).

Проверка: `node --version` (ожидается `v20.x` и выше) и `npm --version`

#### Docker

Проект поднимает PostgreSQL и MinIO (S3-совместимое хранилище файлов) как Docker-контейнеры, поэтому без Docker не запустится.

**Windows и macOS:** установите **Docker Desktop** — https://www.docker.com/products/docker-desktop/. На Windows при установке выберите использование WSL 2. После установки запустите Docker Desktop и дождитесь, пока статус покажет, что движок работает (engine running).

**Linux (Debian/Ubuntu):** установите Docker Engine и Compose plugin (входит в docker.io):
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
```
Последняя команда добавляет пользователя в группу `docker`, чтобы запускать `docker` без `sudo` — **после неё нужно перезапустить терминал или перелогиниться**.

Проверка:
```bash
docker --version
docker compose version
docker run --rm hello-world   # при первом запуске скачается маленький тестовый образ
```

> Если после установки Docker Desktop/Engine терминал не находит команду `docker` — перезапустите терминал полностью (на Windows ещё раз выйдите и войдите в систему, чтобы применилось добавление в группу).

### 2. Установка проекта (клонирование)

**Терминал A**

Склонируйте репозиторий и перейдите в папку проекта:

```bash
git clone <ссылка на репозиторий>
cd 04-fullstack-mvp
```

### 3. Backend

**Терминал A** (после этих команд терминал остаётся свободным для дальнейших шагов)

```bash
cd backend
npm install
```

При установке зависимостей на некоторых версиях npm (11.16+) может появиться предупреждение allow-scripts о заблокированных install/postinstall-скриптах (включая генерацию Prisma Client). Это особенность защиты npm, не самого проекта. Решение: выполните `npm approve-scripts --allow-scripts-pending`, а Prisma Client сгенерируйте отдельно на шаге ниже — после создания файла `.env`.

Поднимите Postgres и MinIO (флаг `-d` запускает их в фоновом режиме, терминал сразу освобождается):

```bash
docker compose up -d
```

Полезные команды для работы с контейнерами:

```bash
docker compose ps          # проверить, что контейнеры запущены (ожидается lumenbridge-postgres и lumenbridge-minio)
docker compose down        # остановить контейнеры (данные сохраняются)
docker compose down -v     # остановить и удалить данные томов — осторожно, все данные БД будут удалены
```

> Если команда `docker compose up -d` не находится, попробуйте `docker-compose up -d` (с дефисом между docker и compose) — на некоторых системах установлена более старая отдельная утилита `docker-compose` вместо встроенной в Docker команды `docker compose`.

Создайте файл `.env` в папке `backend` — проще всего скопировать готовый шаблон:

```bash
cp .env.example .env
```

Итоговый вид файла для локального запуска (при необходимости отредактируйте значения):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumenbridge"
PORT=3001
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="change-me-user-secret"
JWT_SECRET_ADMIN="change-me-admin-secret"
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="lumenbridge"
```

Сгенерируйте Prisma Client (на свежем клоне это обязательный шаг после одобрения install-скриптов — команда читает `DATABASE_URL` из созданного выше `.env`):

```bash
npx prisma generate
```

Примените миграции и заполните тестовые данные (всё ещё **Терминал A**). Миграции и seed разделены на две команды: `migrate deploy` применяет схему без автоматического запуска seed (быстро, не создаёт shadow-базу), `seed.ts` наполняет базу тестовыми данными:

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

**Откройте новый, второй терминал (Терминал B)** — терминал будет занят логами backend, пока вы не нажмёте `Ctrl+C`.

Запустите backend:

```bash
npm run start:dev
```

Сервер поднимется на http://localhost:3001.

| Команда | Описание |
|---|---|
| `npm run start:dev` | Запускает backend в режиме watch на http://localhost:3001 |
| `npm run start` | Запускает backend из исходников (без предварительной сборки) |
| `npm run build` | Собирает production-версию в `dist/` |
| `npm run start:prod` | Запускает собранную production-версию (`node dist/src/main.js`, после `npm run build`) |
| `npm run lint` | Проверяет код на ошибки |
| `npx prisma generate` | Генерирует Prisma Client (нужно на свежем клоне после установки) |
| `npx prisma migrate deploy` | Применяет миграции к базе данных |
| `npm run prisma:studio` | Открывает Prisma Studio для просмотра данных |
| `npx tsx prisma/seed.ts` | Заполняет тестовые данные: admin/operator и mock-клиенты |

### 4. Frontend

**Откройте новый, третий терминал (Терминал C)** — backend в Терминале B в это время продолжает работать, не трогайте его.

```bash
cd ../frontend
npm install
```

Если вы открыли новый терминал не из папки `backend`, укажите полный путь к проекту, например: `cd путь/к/проекту/frontend`.

При появлении предупреждения allow-scripts (см. шаг 3 «Backend») выполните `npm approve-scripts --allow-scripts-pending`.

Создайте файл `.env.local` в папке `frontend` — скопируйте шаблон:

```bash
cp .env.local.example .env.local
```

Содержимое файла (при необходимости отредактируйте):

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Запустите frontend (эта команда тоже не завершится сама — терминал будет занят логами frontend):

```bash
npm run dev
```

| Команда | Описание |
|---|---|
| `npm run dev` | Запускает локальный сервер на http://localhost:3000 |
| `npm run build` | Собирает production-версию сайта |
| `npm run start` | Запускает собранную production-версию (после `npm run build`) |
| `npm run lint` | Проверяет код на ошибки и несоответствие стилю через ESLint |

### 5. Проверка полного flow

1. Поднимите Postgres/MinIO: `docker compose up -d` (в папке `backend`, Терминал A — освобождается сразу)
2. Запустите backend: `npm run start:dev` (в папке `backend`, Терминал B — остаётся открытым)
3. Запустите frontend: `npm run dev` (в папке `frontend`, Терминал C — остаётся открытым)
4. Откройте http://localhost:3000 — рассчитайте условия в калькуляторе и отправьте заявку через `/apply`
5. Войдите в личный кабинет `/login` по номеру телефона, указанному в заявке, — код из mock-OTP приходит в ответе API (см. консоль/network) вместо реального SMS
6. Откройте http://localhost:3000/admin и войдите тестовыми учётными данными оператора или администратора (см. ниже) — новая заявка появится в разделе заявок
7. Возьмите заявку в обработку и одобрите её — в личном кабинете пользователя появится займ, ожидающий подписания
8. Подпишите займ в кабинете через OTP-код — автоматически создастся график платежей
9. Создайте в кабинете заявку на оплату — она появится в админ-панели в разделе платежей
10. Подтвердите заявку на оплату и зафиксируйте платёж от лица администратора — график и статус займа обновятся, изменения будут видны в личном кабинете после обновления страницы

### 6. Что должно работать после запуска

| Что проверить | URL |
|---|---|
| Главная страница | http://localhost:3000 |
| Форма заявки | http://localhost:3000/apply |
| Вход в личный кабинет | http://localhost:3000/login |
| Админ-панель | http://localhost:3000/admin/login |
| Backend (health-check) | http://localhost:3001/health |
| Prisma Studio (пока запущен) | http://localhost:5555 |

## Калькулятор

Расчёт аннуитетного платежа:

```
A = P × (r × (1 + r)^n) / ((1 + r)^n − 1)
Total = A × n
```

где `P` — сумма займа, `r` — дневная ставка (учебное значение `0.008` = 0.8% в день), `n` — срок займа в днях, `A` — размер ежедневного платежа, `Total` — общая сумма к возврату.

Пример: `P = 5 000 EUR`, `n = 7 дней`, `r = 0.008` → ежедневный платёж `A ≈ 737.32 EUR`, итоговая сумма к возврату `Total ≈ 5 161.27 EUR`.

Формула реализована один раз на backend (`CalculatorService`, эндпоинт `POST /calculator/estimate`) и используется как источник итоговых цифр; на frontend есть локальная копия расчёта для мгновенного превью в виджете калькулятора на лендинге.

## Что реализовано как mock

- **SMS OTP для входа пользователя** — код не отправляется через реальный SMS-провайдер. `POST /auth/request-otp` генерирует 6-значный код и возвращает его прямо в теле ответа (`mockOtp`) вместо отправки SMS; `POST /auth/verify-otp` подтверждает код и выдаёт JWT. Тот же механизм используется для подписания займа (`request-sign-otp` / `confirm-sign`).
- **Подписание договора** — при подписании backend сохраняет только дату подписания, IP-адрес и user agent запроса; юридически значимого документооборота нет, договор в кабинете — mock/заглушка.
- **Оплата займа** — реальных платёжных интеграций нет: пользователь создаёт заявку на оплату с суммой и реквизитами/reference перевода, администратор проверяет её вручную и вручную фиксирует платёж.
- **Файлы/документы** — хранятся в локальном MinIO (S3-совместимое API), поднимается через `docker compose`, реальным облачным хранилищем не является.

## Управление данными

Если нужно посмотреть, изменить или удалить записи (заявки, займы, пользователей, платежи и т.д.), откройте Prisma Studio — визуальный редактор базы данных:

```bash
cd backend
npx prisma studio --port 5555
```

(или `npm run prisma:studio`). Команда откроет сайт в браузере (по умолчанию http://localhost:5555), где все таблицы можно просматривать, а записи — менять и удалять через формы. Это долгоживущий процесс — терминал будет занят, пока вы не нажмёте `Ctrl+C`; остановить Prisma Studio можно в любой момент, данные при этом сохраняются.

> **Важно:** изменения в Prisma Studio применяются напрямую к базе данных, минуя бизнес-логику backend (без проверок ролей, аудита и уведомлений).

Полностью обнулить базу можно командой `docker compose down -v` — она остановит контейнеры и удалит тома с данными, после чего потребуется заново: `docker compose up -d` → `npx prisma migrate deploy` → `npx tsx prisma/seed.ts`.

## Тестовые учётные данные

Создаются командой `npx tsx prisma/seed.ts`.

Админ-панель (`/admin`):

| Роль | Логин | Пароль |
|---|---|---|
| admin | `admin` | `admin123` |
| operator | `operator` | `operator123` |

Личный кабинет пользователя (`/login`): отдельной учётной записи заводить не нужно — достаточно любого номера телефона, указанного при подаче заявки (`/apply`). Кабинет создаётся автоматически при первой заявке. Код подтверждения (mock OTP) возвращается в ответе `POST /auth/request-otp` (поле `mockOtp`), так как реальный SMS-провайдер не подключён.

## Роли и возможности

| Роль | Вход | Что может |
|---|---|---|
| **Клиент** | Личный кабинет `/login` | Подать заявку на займ (физлицо/бизнес) через `/apply`; войти по номеру телефона через mock OTP; в кабинете — свои заявки, займы и график платежей, подписание займа по OTP, mock-договор, заявки на оплату, уведомления; оставить обращение через форму обратной связи |
| **Оператор** | Админ-панель `/admin` | Работает с заявками (смена статуса, комментарии), клиентами, займами, платежами (заявки на оплату, фиксация платежей, просрочки), уведомлениями, сообщениями обратной связи и аудит-журналом. Не видит раздел «Администраторы» и не может управлять админ-аккаунтами и ролями |
| **Администратор** | Админ-панель `/admin` | Всё, что может оператор, плюс управление админ-аккаунтами и ролями (раздел «Администраторы») |

## Основные API-эндпоинты

Все эндпоинты без префикса `api`, сервер отвечает на http://localhost:3001.

Пользователь (JWT пользователя):

| Метод | Путь | Описание |
|---|---|---|
| POST | `/auth/request-otp` | Запросить mock OTP-код (вход в кабинет) |
| POST | `/auth/verify-otp` | Подтвердить OTP, получить JWT пользователя |
| POST | `/applications` | Подать заявку (физлицо/бизнес) |
| GET | `/applications/me` | Свои заявки |
| GET | `/loans/me` | Свои займы |
| POST | `/loans/:id/request-sign-otp` | Запросить OTP для подписания займа |
| POST | `/loans/:id/confirm-sign` | Подписать займ (создаётся график платежей) |
| POST | `/loans/:id/payment-requests` | Создать заявку на оплату |
| GET | `/payment-requests/users/me` | Свои заявки на оплату |
| GET | `/users/me/notifications` | Свои уведомления |
| POST | `/contact-messages` | Форма обратной связи |
| POST | `/files/upload` | Загрузка файла в S3-совместимое хранилище |

Админ-панель (JWT администратора/оператора):

| Метод | Путь | Описание |
|---|---|---|
| POST | `/admin-auth/login` | Вход в админ-панель (admin/operator) |
| GET | `/applications` | Все заявки (+ поиск и фильтры) |
| PATCH | `/applications/:id/status` | Сменить статус заявки |
| POST | `/applications/:id/comments` | Добавить комментарий оператора |
| GET | `/clients` | Клиенты (агрегация, автоматическое определение просрочек) |
| GET | `/clients/:id` | Карточка клиента |
| GET | `/loans` | Все займы (активные/закрытые) |
| PATCH | `/loans/:id/status` | Сменить статус займа |
| PATCH | `/loans/:id/schedule/:itemId` | Отметить платёж графика |
| POST | `/loans/:id/close` | Закрыть займ |
| GET | `/payment-requests` | Заявки на оплату |
| PATCH | `/payment-requests/:id` | Подтвердить/отклонить заявку на оплату |
| POST | `/loans/:id/payments` | Ручная фиксация платежа |
| GET | `/admin/notifications` | Все уведомления |
| GET | `/admin/contact-messages` | Сообщения обратной связи |
| GET / POST / PATCH / DELETE | `/admin-users` | Управление админ-аккаунтами (только admin) |
| GET | `/audit-logs` | Журнал действий администраторов/операторов |
| POST | `/calculator/estimate` | Аннуитетный расчёт условий займа |

## Частые проблемы

### `docker: command not found`
Docker не установлен или не добавлен в PATH. Установите его по шагу 1 «Установка необходимого ПО» (Docker Desktop на Windows/macOS, Docker Engine на Linux) и перезапустите терминал.

### `docker compose: command not found`
Установлен Docker без Compose plugin — нужно, чтобы работала команда `docker compose version`. Установите плагин (на Linux он входит в `docker-compose-plugin`, см. шаг 1). На старых системах можно использовать отдельную утилиту `docker-compose`.

### `P1001: Can't reach database server`
PostgreSQL не поднят. Выполните `docker compose up -d` (в папке `backend`) и проверьте `docker compose ps` — контейнер `lumenbridge-postgres` должен быть `running`/`healthy`.

### Предупреждение allow-scripts при `npm install`
Это защита npm, а не ошибка проекта. Выполните `npm approve-scripts --allow-scripts-pending`, затем после создания `.env` — `npx prisma generate`.

### `EADDRINUSE: address already in use :::3000` или `:::3001`
Порт занят другим процессом (например, уже запущен второй экземпляр сервера). Остановите старый процесс (`Ctrl+C` в его терминале) или смените порт в `.env` (backend) / `.env.local` (frontend).

### «Неверный логин или пароль» при входе в админ-панель
Скорее всего не выполнен seed — учётные записи ещё не созданы. Выполните `npx tsx prisma/seed.ts` (в папке `backend`).

### Frontend не видит backend (ошибки сети, пустые списки)
Проверьте:
- backend реально запущен (Терминал B, http://localhost:3001);
- в `frontend/.env.local` есть `NEXT_PUBLIC_API_URL="http://localhost:3001"`;
- в `backend/.env` есть `FRONTEND_URL="http://localhost:3000"` (CORS).

### Prisma Studio не открывается
Проверьте, что поднят PostgreSQL и в `backend/.env` есть корректный `DATABASE_URL`, затем запустите `npx prisma studio` из папки `backend`.

## Известные ограничения

- Реальная отправка SMS не реализована — OTP-код возвращается в ответе API (см. раздел [Что реализовано как mock](#что-реализовано-как-mock)).
- Платежи не проходят через реальные платёжные системы — подтверждаются вручную оператором/администратором в админ-панели.
- Скоринг заявок отсутствует — решение по заявке (одобрить/отклонить) принимает оператор вручную.
- Хранилище файлов — локальный MinIO, поднимаемый через `docker compose`, а не облачный S3.
- Приложение не предназначено для реальных персональных данных и реальных денежных операций.