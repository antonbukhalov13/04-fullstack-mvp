import { Injectable, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';
import path from 'path';

const ALLOWED_OWNER_TYPES = ['application', 'contact_message'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class FilesService implements OnModuleInit {
  private s3Client: S3Client;
  private bucket: string;
  private readonly logger = new Logger(FilesService.name);

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

  async onModuleInit() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`S3 bucket "${this.bucket}" already exists`);
    } catch {
      this.logger.log(`S3 bucket "${this.bucket}" not found, creating...`);
      await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`S3 bucket "${this.bucket}" created`);
    }
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

    if (ownerType && !ALLOWED_OWNER_TYPES.includes(ownerType)) {
      throw new BadRequestException(
        `Invalid ownerType. Allowed: ${ALLOWED_OWNER_TYPES.join(', ')}`,
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
        ownerType: (ownerType || 'upload') as any,
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
        ownerType: ownerType as any,
        ownerId,
      },
    });
  }
}
