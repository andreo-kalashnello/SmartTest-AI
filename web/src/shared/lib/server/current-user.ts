import { prisma } from "./prisma";
import { getSessionUserId } from "./session";

export function toPublicUser(user: { id: string; email: string; name: string }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
}

/** @deprecated використовуйте getCurrentUser */
export async function getCurrentTeacher() {
  return getCurrentUser();
}
