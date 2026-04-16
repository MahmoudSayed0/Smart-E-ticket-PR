import { UuidCodeStrategy } from './uuid-code.strategy';
import { ShortCodeStrategy } from './short-code.strategy';
import { NumericCodeStrategy } from './numeric-code.strategy';

describe('ITicketCodeStrategy implementations', () => {
  describe('UuidCodeStrategy', () => {
    const strategy = new UuidCodeStrategy();

    it('generates a valid UUID v4', () => {
      const code = strategy.generate();
      expect(code).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('generates a unique code on each call', () => {
      expect(strategy.generate()).not.toBe(strategy.generate());
    });
  });

  describe('ShortCodeStrategy', () => {
    const strategy = new ShortCodeStrategy();

    it('generates a code in the format XXXX-XXXX', () => {
      const code = strategy.generate();
      expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    });

    it('produces different codes across invocations', () => {
      const codes = new Set(Array.from({ length: 20 }, () => strategy.generate()));
      expect(codes.size).toBeGreaterThan(15);
    });
  });

  describe('NumericCodeStrategy', () => {
    const strategy = new NumericCodeStrategy();

    it('generates a 6-digit numeric code', () => {
      const code = strategy.generate();
      expect(code).toMatch(/^\d{6}$/);
    });
  });
});
