import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FilesModule } from './modules/files/files.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { CalculatorModule } from './modules/calculator/calculator.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { LoansModule } from './modules/loans/loans.module';
import { PaymentRequestsModule } from './modules/payment-requests/payment-requests.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ContactMessagesModule } from './modules/contact-messages/contact-messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    FilesModule,
    AuthModule,
    AdminAuthModule,
    CalculatorModule,
    ApplicationsModule,
    LoansModule,
    PaymentRequestsModule,
    PaymentsModule,
    NotificationsModule,
    ContactMessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
