import { Injectable } from '@nestjs/common';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verify(hash: string, password: string): Promise<boolean> {
    if (hash.startsWith('$argon2')) {
      return argon2.verify(hash, password);
    }

    const [salt, storedKey] = hash.split(':');
    if (!salt || !storedKey) return false;
    const actual = Buffer.from(scryptSync(password, salt, 64).toString('base64url'));
    const expected = Buffer.from(storedKey);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
}
