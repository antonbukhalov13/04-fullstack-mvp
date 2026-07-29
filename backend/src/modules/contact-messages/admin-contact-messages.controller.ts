import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ContactMessagesService } from './contact-messages.service';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/contact-messages')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'operator')
export class AdminContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  @Get()
  async findAllAdmin(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const take = Math.min(Number(limit) || 20, 100);
    const skip = Number(offset) || 0;
    return this.contactMessagesService.findAllAdmin(take, skip);
  }
}
