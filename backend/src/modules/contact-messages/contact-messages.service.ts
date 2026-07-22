import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactMessagesService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async create(dto: CreateContactMessageDto) {
    if (dto.attachmentId) {
      const file = await this.filesService.getFileById(dto.attachmentId);
      if (!file) {
        throw new NotFoundException('Attachment not found');
      }
    }

    const contactMessage = await this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        attachmentId: dto.attachmentId || null,
      },
    });

    if (dto.attachmentId) {
      await this.filesService.updateFileOwnership(
        dto.attachmentId,
        'contact_message',
        contactMessage.id,
      );
    }

    return contactMessage;
  }
}
