import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  async findAll(@Query() query: QueryApplicationsDto) {
    return this.applicationsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, dto);
  }

  @Post(':id/comments')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.applicationsService.addComment(id, dto);
  }
}
