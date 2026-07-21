import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';
import path from 'path';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.bucket = this.configService.get<string>('S3_BUCKET') || 'lumenbridge';

    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      region: this.configService.get<string>('S3_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY') || '',
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY') || '',
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    ownerType?: string,
    ownerId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    const fileKey = `${ownerType || 'uploads'}/${randomUUID()}${path.extname(file.originalname)}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const fileRecord = await this.prisma.fileAttachment.create({
      data: {
        ownerType: ownerType || 'upload',
        ownerId: ownerId || null,
        s3Key: fileKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    const fileUrl = await this.getSignedUrl(fileKey);

    return {
      id: fileRecord.id,
      url: fileUrl,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async getFileById(id: string) {
    return this.prisma.fileAttachment.findUnique({
      where: { id },
    });
  }

  async updateFileOwnership(
    id: string,
    ownerType: string,
    ownerId: string,
  ) {
    return this.prisma.fileAttachment.update({
      where: { id },
      data: {
        ownerType,
        ownerId,
      },
    });
  }
}
