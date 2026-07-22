import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateContactMessageDto) {
    return this.contactMessagesService.create(dto);
  }
}
