import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/async-handler';
import { sendSystemEmail, renderEmailLayout } from '../lib/email';
import { env } from '../config/env';

const router = Router();

router.post(
  '/contact',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      message: z.string().min(10),
    });
    const body = schema.parse(req.body);

    await sendSystemEmail({
      to: env.EMAIL_FROM,
      subject: `SimpleAutomate contact from ${body.name}`,
      html: renderEmailLayout(
        'New contact submission',
        `<p><strong>Name:</strong> ${body.name}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p>${body.message}</p>`,
      ),
    });

    return res.json({ message: 'Received' });
  }),
);

export default router;

