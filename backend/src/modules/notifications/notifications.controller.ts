import { Controller, Get, Patch, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Controller('users/me/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread-count')
  async countUnread(@CurrentUser() user: CurrentUserPayload) {
    return this.notificationsService.countUnread(user.id);
  }

  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const take = Math.min(Number(limit) || 20, 100);
    const skip = Number(offset) || 0;
    return this.notificationsService.findByUser(user.id, take, skip);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser() user: CurrentUserPayload) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.notificationsService.markAsRead(id, user.id);
  }
}
