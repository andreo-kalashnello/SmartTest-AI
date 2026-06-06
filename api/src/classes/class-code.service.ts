import { Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

@Injectable()
export class ClassCodeService {
  generateInviteCode(): string {
    let code = '';
    for (let index = 0; index < CODE_LENGTH; index += 1) {
      code += ALPHABET[randomInt(0, ALPHABET.length)];
    }
    return code;
  }
}
