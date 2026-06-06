import { InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const MAX_PIN_CREATE_ATTEMPTS = 10;

export function isPinUniqueConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes('pin')
  );
}

export function assertCanRetryPin(attempt: number): void {
  if (attempt < MAX_PIN_CREATE_ATTEMPTS - 1) return;
  throw new InternalServerErrorException({ message: 'Unable to allocate a unique test PIN' });
}

export { MAX_PIN_CREATE_ATTEMPTS };
