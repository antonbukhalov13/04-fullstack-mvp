import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMine(
    @Req() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const take = Math.min(Number(limit) || 20, 100);
    const skip = Number(offset) || 0;
    return this.applicationsService.findByUserId(req.user.id, take, skip);
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  async findAll(
    @Query() query: QueryApplicationsDto,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const take = Math.min(Number(limit) || 20, 100);
    const skip = Number(offset) || 0;
    return this.applicationsService.findAll(query, take, skip);
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
