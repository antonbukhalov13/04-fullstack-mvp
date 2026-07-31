import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const hoursAgo = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000);

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function paymentPlan(principal: number, termDays: number) {
  const r = 0.008;
  const factor = Math.pow(1 + r, termDays);
  const annuity = (principal * (r * factor)) / (factor - 1);
  const paymentAmount = round2(annuity);
  const lastAmount = round2(annuity * termDays - paymentAmount * (termDays - 1));
  return { paymentAmount, lastAmount };
}

interface ScheduleItemInput {
  loanId: string;
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAmount: number;
}

function buildSchedule(
  loanId: string,
  principal: number,
  termDays: number,
  signedAt: Date,
): ScheduleItemInput[] {
  const { paymentAmount, lastAmount } = paymentPlan(principal, termDays);
  const items: ScheduleItemInput[] = [];
  for (let i = 0; i < termDays; i++) {
    const dueDate = new Date(signedAt);
    dueDate.setDate(dueDate.getDate() + i);
    items.push({
      loanId,
      dueDate,
      amount: i === termDays - 1 ? lastAmount : paymentAmount,
      status: 'pending',
      paidAmount: 0,
    });
  }
  return items;
}

async function seedMockData() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('Mock data skipped: users already exist.');
    return;
  }

  console.log('Creating mock business data...');

  const admin = await prisma.adminUser.findUnique({ where: { login: 'admin' } });
  if (!admin) {
    throw new Error('Admin user not found — run seed with admin/operator first');
  }

  // ─── Пользователи ────────────────────────────────────────────────
  const ivan = await prisma.user.create({
    data: { phone: '+1234567890', name: 'Иван Петров', createdAt: daysAgo(21) },
  });
  const maria = await prisma.user.create({
    data: { phone: '+1987654321', name: 'Мария Иванова', createdAt: daysAgo(14) },
  });
  const techline = await prisma.user.create({
    data: { phone: '+1444555666', name: null, createdAt: daysAgo(10) },
  });

  // ─── Заявки ──────────────────────────────────────────────────────
  const appIvanApproved = await prisma.application.create({
    data: {
      userId: ivan.id,
      applicantType: 'individual',
      amount: 1000,
      termDays: 30,
      status: 'approved',
      comment: 'Одобрена оператором',
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'ivan.petrov@example.com',
      createdAt: daysAgo(18),
    },
  });
  const appIvanNew = await prisma.application.create({
    data: {
      userId: ivan.id,
      applicantType: 'individual',
      amount: 500,
      termDays: 15,
      status: 'new',
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'ivan.petrov@example.com',
      createdAt: daysAgo(2),
    },
  });
  const appMariaInProgress = await prisma.application.create({
    data: {
      userId: maria.id,
      applicantType: 'individual',
      amount: 2000,
      termDays: 60,
      status: 'in_progress',
      comment: 'Взята в обработку',
      firstName: 'Мария',
      lastName: 'Иванова',
      email: 'maria.ivanova@example.com',
      createdAt: daysAgo(6),
    },
  });
  const appTechRejected = await prisma.application.create({
    data: {
      userId: techline.id,
      applicantType: 'business',
      amount: 50000,
      termDays: 90,
      status: 'rejected',
      comment: 'Недостаточно документов',
      companyName: 'ООО «ТехноЛайн»',
      registrationNumber: '123456789',
      companyEmail: 'info@techline.example.com',
      companyPhone: '+1444555666',
      createdAt: daysAgo(4),
    },
  });
  const appMariaClosed = await prisma.application.create({
    data: {
      userId: maria.id,
      applicantType: 'individual',
      amount: 1500,
      termDays: 45,
      status: 'approved',
      comment: 'Займ погашен',
      firstName: 'Мария',
      lastName: 'Иванова',
      email: 'maria.ivanova@example.com',
      createdAt: daysAgo(60),
    },
  });

  // ─── Займы ───────────────────────────────────────────────────────
  const loanIvanActive = await prisma.loan.create({
    data: {
      applicationId: appIvanApproved.id,
      userId: ivan.id,
      amount: 1000,
      dailyRate: 0.008,
      termDays: 30,
      status: 'active',
      signedAt: daysAgo(2),
      signedIp: '0.0.0.0',
      signedUserAgent: 'Mozilla/5.0 (compatible; mentor-check)',
      createdAt: daysAgo(18),
    },
  });
  const loanMariaSigning = await prisma.loan.create({
    data: {
      applicationId: appMariaInProgress.id,
      userId: maria.id,
      amount: 2000,
      dailyRate: 0.008,
      termDays: 60,
      status: 'pending_signature',
      createdAt: daysAgo(6),
    },
  });
  const loanMariaClosed = await prisma.loan.create({
    data: {
      applicationId: appMariaClosed.id,
      userId: maria.id,
      amount: 1500,
      dailyRate: 0.008,
      termDays: 45,
      status: 'closed',
      signedAt: daysAgo(58),
      signedIp: '0.0.0.0',
      signedUserAgent: 'Mozilla/5.0 (compatible; mentor-check)',
      createdAt: daysAgo(60),
    },
  });

  // ─── Графики платежей ────────────────────────────────────────────
  const scheduleActive = buildSchedule(
    loanIvanActive.id,
    loanIvanActive.amount,
    loanIvanActive.termDays,
    loanIvanActive.signedAt!,
  );
  scheduleActive[0] = { ...scheduleActive[0], status: 'paid', paidAmount: scheduleActive[0].amount };
  scheduleActive[1] = { ...scheduleActive[1], status: 'overdue' };
  scheduleActive[2] = { ...scheduleActive[2], status: 'paid', paidAmount: scheduleActive[2].amount };

  const scheduleClosed = buildSchedule(
    loanMariaClosed.id,
    loanMariaClosed.amount,
    loanMariaClosed.termDays,
    loanMariaClosed.signedAt!,
  ).map((item) => ({ ...item, status: 'paid' as const, paidAmount: item.amount }));

  await prisma.paymentScheduleItem.createMany({
    data: [...scheduleActive, ...scheduleClosed],
  });

  // ─── Заявки на оплату и платежи ──────────────────────────────────
  const activePlan = paymentPlan(loanIvanActive.amount, loanIvanActive.termDays);

  const prRejected = await prisma.paymentRequest.create({
    data: {
      loanId: loanIvanActive.id,
      userId: ivan.id,
      amount: activePlan.paymentAmount,
      reference: 'Платёж по графику (№2)',
      status: 'rejected',
      createdAt: daysAgo(2),
    },
  });
  const prApproved = await prisma.paymentRequest.create({
    data: {
      loanId: loanIvanActive.id,
      userId: ivan.id,
      amount: activePlan.paymentAmount,
      reference: 'Платёж по графику (№3)',
      status: 'approved',
      createdAt: daysAgo(2),
    },
  });
  await prisma.payment.create({
    data: {
      loanId: loanIvanActive.id,
      paymentRequestId: prApproved.id,
      amount: activePlan.paymentAmount,
      date: daysAgo(1),
      recordedByAdminId: admin.id,
    },
  });
  await prisma.paymentRequest.create({
    data: {
      loanId: loanIvanActive.id,
      userId: ivan.id,
      amount: activePlan.paymentAmount,
      reference: 'Платёж по графику (№4)',
      status: 'pending',
      createdAt: hoursAgo(6),
    },
  });

  // ─── Уведомления ─────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      // Иван Петров
      { userId: ivan.id, type: 'application.status.changed', message: 'Заявка одобрена', isRead: true, createdAt: daysAgo(18) },
      { userId: ivan.id, type: 'loan.created', message: 'Займ ожидает подписания', isRead: true, createdAt: daysAgo(18) },
      { userId: ivan.id, type: 'loan.signed', message: 'Займ подписан и активирован', isRead: true, createdAt: daysAgo(2) },
      { userId: ivan.id, type: 'payment-request.status.changed', message: 'Платёж отклонён', isRead: true, createdAt: daysAgo(2) },
      { userId: ivan.id, type: 'payment-request.status.changed', message: 'Платёж подтверждён', isRead: true, createdAt: daysAgo(1) },
      { userId: ivan.id, type: 'payment.recorded', message: 'Платёж зафиксирован', isRead: true, createdAt: daysAgo(1) },
      { userId: ivan.id, type: 'payment.overdue', message: 'Просрочка платежа', isRead: false, createdAt: daysAgo(1) },
      { userId: ivan.id, type: 'payment-request.created', message: 'Заявка на оплату создана', isRead: false, createdAt: hoursAgo(6) },
      // Мария Иванова
      { userId: maria.id, type: 'application.status.changed', message: 'Заявка одобрена', isRead: true, createdAt: daysAgo(60) },
      { userId: maria.id, type: 'loan.created', message: 'Займ ожидает подписания', isRead: true, createdAt: daysAgo(60) },
      { userId: maria.id, type: 'loan.signed', message: 'Займ подписан и активирован', isRead: true, createdAt: daysAgo(58) },
      { userId: maria.id, type: 'loan.closed', message: 'Займ закрыт', isRead: true, createdAt: daysAgo(13) },
      { userId: maria.id, type: 'application.status.changed', message: 'Заявка взята в обработку', isRead: false, createdAt: daysAgo(6) },
      { userId: maria.id, type: 'loan.created', message: 'Займ ожидает подписания', isRead: false, createdAt: daysAgo(6) },
      // ООО «ТехноЛайн»
      { userId: techline.id, type: 'application.status.changed', message: 'Заявка отклонена', isRead: false, createdAt: daysAgo(4) },
    ],
  });

  // ─── Сообщения из формы обратной связи ───────────────────────────
  await prisma.contactMessage.createMany({
    data: [
      {
        name: 'Елена Смирнова',
        email: 'elena.smirnova@example.com',
        phone: '+79990001122',
        message: 'Добрый день! Подскажите, какие документы нужны для бизнес-займа сроком до 6 месяцев?',
        createdAt: daysAgo(5),
      },
      {
        name: 'Дмитрий Козлов',
        email: 'dmitry.kozlov@example.com',
        phone: '+79990003344',
        message: 'Здравствуйте! Когда появляется договор в личном кабинете после одобрения заявки?',
        createdAt: daysAgo(3),
      },
      {
        name: 'Анна Соколова',
        email: 'anna.sokolova@example.com',
        phone: '+79990005566',
        message: 'Добрый день! Подскажите, можно ли изменить срок займа уже после создания заявки?',
        createdAt: daysAgo(1),
      },
    ],
  });

  console.log('Mock data created.');
}

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });

  // Create operator user
  const operatorPasswordHash = await bcrypt.hash('operator123', 10);
  await prisma.adminUser.upsert({
    where: { login: 'operator' },
    update: {},
    create: {
      login: 'operator',
      passwordHash: operatorPasswordHash,
      role: 'operator',
    },
  });

  await seedMockData();

  console.log('Seed completed!');
  console.log('');
  console.log('Test admin credentials:');
  console.log('  Login: admin');
  console.log('  Password: admin123');
  console.log('  Role: admin');
  console.log('');
  console.log('Test operator credentials:');
  console.log('  Login: operator');
  console.log('  Password: operator123');
  console.log('  Role: operator');
  console.log('');
  console.log('Test client (cabinet login via /login, phone + OTP):');
  console.log('  Phone: +1234567890 (Иван Петров — active loan, overdue, notifications)');
  console.log('  Phone: +1987654321 (Мария Иванова — loan awaiting signature, closed loan)');
  console.log('  Phone: +1444555666 (ООО «ТехноЛайн» — rejected business application)');
  console.log('');
  console.log('Mock OTP code is returned by POST /auth/request-otp in the `mockOtp` field.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
