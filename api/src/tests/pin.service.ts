import { Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';

@Injectable()
export class PinService {
  generatePin(): string {
    return randomInt(100000, 1000000).toString();
  }

  generatePins(count: number): string[] {
    return Array.from({ length: count }, () => this.generatePin());
  }
}
