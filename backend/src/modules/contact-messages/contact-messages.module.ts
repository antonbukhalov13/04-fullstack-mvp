import { Module } from '@nestjs/common';
import { ContactMessagesService } from './contact-messages.service';
import { ContactMessagesController } from './contact-messages.controller';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [ContactMessagesController],
  providers: [ContactMessagesService],
})
export class ContactMessagesModule {}
