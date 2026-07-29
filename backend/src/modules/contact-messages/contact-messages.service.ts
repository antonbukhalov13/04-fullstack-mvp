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

  async findAllAdmin(take: number, skip: number) {
    const where = {};
    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    const data = await Promise.all(
      items.map(async (msg) => {
        let attachmentUrl: string | null = null;
        let attachmentName: string | null = null;
        if (msg.attachmentId) {
          try {
            const file = await this.filesService.getFileById(msg.attachmentId);
            if (file) {
              attachmentUrl = await this.filesService.getSignedUrl(file.s3Key);
              attachmentName = file.originalName;
            }
          } catch {
            // S3/MinIO unavailable — return message without attachment URL
          }
        }
        return { ...msg, attachmentUrl, attachmentName };
      }),
    );

    return { data, total, limit: take, offset: skip };
  }

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
