import { z } from 'zod';

export const createPostSchema = z
  .object({
    content: z.string().max(500, 'Content is too long').optional().default(''),
    photoId: z.string().nullable().optional(),
  })
  .refine(
    (data) => data.content.trim().length > 0 || data.photoId !== null,
    {
      message: 'Either content or photo is required',
      path: ['content'],
    }
  );

export type CreatePost = z.infer<typeof createPostSchema>;

export const updatePostSchema = z
  .object({
    content: z.string().optional(),
    photoId: z.string().nullable(),
  })
  .partial();

export type UpdatePost = z.infer<typeof updatePostSchema>;