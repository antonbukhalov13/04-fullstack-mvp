import { Test, TestingModule } from '@nestjs/testing';
import { CalculatorService, DAILY_RATE } from './calculator.service';

describe('CalculatorService', () => {
  let service: CalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalculatorService],
    }).compile();

    service = module.get<CalculatorService>(CalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('estimate', () => {
    it('should calculate correctly for 1000 EUR / 30 days', () => {
      const result = service.estimate(1000, 30);
      expect(result.amount).toBe(1000);
      expect(result.termDays).toBe(30);
      expect(result.dailyRate).toBe(DAILY_RATE);
      expect(result.payment).toBe(37.63);
      expect(result.total).toBe(1128.77);
    });

    it('should calculate correctly for 5000 EUR / 7 days', () => {
      const result = service.estimate(5000, 7);
      expect(result.amount).toBe(5000);
      expect(result.termDays).toBe(7);
      expect(result.payment).toBe(737.32);
      expect(result.total).toBe(5161.27);
    });

    it('should calculate correctly for 500 EUR / 90 days', () => {
      const result = service.estimate(500, 90);
      expect(result.amount).toBe(500);
      expect(result.termDays).toBe(90);
      expect(result.payment).toBe(7.81);
      expect(result.total).toBe(703.33);
    });

    it('should calculate correctly for 10000 EUR / 60 days', () => {
      const result = service.estimate(10000, 60);
      expect(result.amount).toBe(10000);
      expect(result.termDays).toBe(60);
      expect(result.payment).toBe(210.51);
      expect(result.total).toBe(12630.46);
    });

    it('should throw for zero amount', () => {
      expect(() => service.estimate(0, 30)).toThrow();
    });

    it('should throw for negative amount', () => {
      expect(() => service.estimate(-1000, 30)).toThrow();
    });

    it('should throw for zero term', () => {
      expect(() => service.estimate(1000, 0)).toThrow();
    });

    it('should throw for negative term', () => {
      expect(() => service.estimate(1000, -30)).toThrow();
    });
  });
});
