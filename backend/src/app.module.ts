import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FilesModule } from './modules/files/files.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { CalculatorModule } from './modules/calculator/calculator.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { LoansModule } from './modules/loans/loans.module';
import { PaymentRequestsModule } from './modules/payment-requests/payment-requests.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ContactMessagesModule } from './modules/contact-messages/contact-messages.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000,
      limit: 60,
    }]),
    EventEmitterModule.forRoot(),
    PrismaModule,
    FilesModule,
    AuthModule,
    AdminAuthModule,
    AdminUsersModule,
    CalculatorModule,
    ApplicationsModule,
    LoansModule,
    PaymentRequestsModule,
    PaymentsModule,
    NotificationsModule,
    ContactMessagesModule,
    ClientsModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
