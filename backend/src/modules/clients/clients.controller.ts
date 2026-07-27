import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClientsService } from './clients.service';

@Controller('clients')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'operator')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const take = Math.min(Number(limit) || 20, 100);
    const skip = Number(offset) || 0;
    return this.clientsService.findAll(search, take, skip);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }
}
