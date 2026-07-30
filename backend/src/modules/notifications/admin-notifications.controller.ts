import { Controller, Get, Param, Patch, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/notifications')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'operator')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread-count')
  async countUnreadAdmin() {
    return this.notificationsService.countUnreadAdmin();
  }

  @Get()
  async findAllAdmin(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const take = Math.min(Number(limit) || 20, 100);
    const skip = Number(offset) || 0;
    return this.notificationsService.findAllAdmin(take, skip);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsReadAdmin() {
    return this.notificationsService.markAllAsReadAdmin();
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsReadAdmin(@Param('id') id: string) {
    return this.notificationsService.markAsReadAdmin(id);
  }
}
