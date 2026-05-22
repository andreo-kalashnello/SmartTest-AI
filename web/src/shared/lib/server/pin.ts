import { prisma } from "./prisma";

export async function generateUniquePin(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const existing = await prisma.test.findUnique({
      where: { pin },
      select: { id: true },
    });

    if (!existing) return pin;
  }

  throw new Error("Unable to generate unique PIN");
}
