import { createHash, randomBytes } from 'node:crypto';
import type { Response } from 'express';
import type { EntityManager } from 'typeorm';
import { User } from '../entities/User.js';
import { UserSession } from '../entities/UserSession.js';

export const SESSION_COOKIE = 'aimc_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(manager: EntityManager, user: User) {
  const token = randomBytes(32).toString('hex');
  const sessions = manager.getRepository(UserSession);

  await sessions.save(
    sessions.create({
      tokenHash: hashSessionToken(token),
      user,
      expiresAt: new Date(Date.now() + SESSION_DURATION),
    }),
  );

  return token;
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

export async function getSessionUser(
  manager: EntityManager,
  cookieHeader: string | undefined,
): Promise<User | null> {
  const token = cookieHeader
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

  const session = await manager.getRepository(UserSession).findOne({
    where: { tokenHash: hashSessionToken(token) },
    relations: { user: true },
  });

  if (!session || session.expiresAt <= new Date() || !session.user.active) {
    return null;
  }

  return session.user;
}
