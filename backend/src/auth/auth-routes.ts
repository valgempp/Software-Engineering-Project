import {
  createSession,
  setSessionCookie,
  getSessionUser,
} from './session-service.js';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { QueryFailedError, type Repository } from 'typeorm';
import { User } from '../entities/User.js';

const registrationSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  username: z.string().trim().min(1).max(100),
  password: z
    .string()
    .min(8)
    .refine(
      (value) => Buffer.byteLength(value, 'utf8') <= 72,
      'Password must not exceed 72 bytes',
    ),
  privacyAccepted: z.literal(true),
});

export function authRouter(users: Repository<User>) {
  const router = Router();

  router.post('/register', async (req, res, next) => {
    const result = registrationSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Invalid registration data',
        details: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    const { email, username, password } = result.data;

    try {
      const existingUser = await users.findOne({
        where: [{ email }, { username }],
      });

      if (existingUser) {
        res.status(409).json({
          error: 'Email or username already exists',
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const { user, token } = await users.manager.transaction(
        async (manager) => {
          const repository = manager.getRepository(User);

          const user = await repository.save(
            repository.create({
              email,
              username,
              passwordHash,
              active: true,
              privacyAcceptedAt: new Date(),
            }),
          );

          const token = await createSession(manager, user);

          return { user, token };
        },
      );

      setSessionCookie(res, token);

      res.status(201).json({
        id: user.id,
        email: user.email,
        username: user.username,
        active: user.active,
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        res.status(409).json({
          error: 'Email or username already exists',
        });
        return;
      }

      next(error);
    }
  });

  router.get('/me', async (req, res, next) => {
    try {
      const user = await getSessionUser(users.manager, req.headers.cookie);

      if (!user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        active: user.active,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
