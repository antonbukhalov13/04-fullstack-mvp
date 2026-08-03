import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { OverdueModule } from '../overdue/overdue.module';

@Module({
  imports: [OverdueModule],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
