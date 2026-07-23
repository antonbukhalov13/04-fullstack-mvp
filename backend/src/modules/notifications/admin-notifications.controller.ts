import { Controller, Get, Param, Patch, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/notifications')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'operator')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAllAdmin() {
    return this.notificationsService.findAllAdmin();
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsReadAdmin(@Param('id') id: string) {
    return this.notificationsService.markAsReadAdmin(id);
  }
}
