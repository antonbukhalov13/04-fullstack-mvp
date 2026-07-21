import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import { EstimateDto } from './dto/estimate.dto';

@Controller('calculator')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  estimate(@Body() dto: EstimateDto) {
    return this.calculatorService.estimate(dto.amount, dto.termDays);
  }
}
