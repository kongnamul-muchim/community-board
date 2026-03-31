import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다.').max(20, '닉네임은 20자 이하여야 합니다.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword']
})

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.')
})

export const createPostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자 이하여야 합니다.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
  categoryId: z.string().optional(),
  imageUrls: z.array(z.string()).optional()
})

export const updatePostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자 이하여야 합니다.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
  categoryId: z.string().optional().nullable(),
  imageUrls: z.array(z.string()).optional()
})

export const createCategorySchema = z.object({
  name: z.string().min(1, '카테고리 이름을 입력해주세요.').max(50, '카테고리 이름은 50자 이하여야 합니다.'),
  description: z.string().max(200, '설명은 200자 이하여야 합니다.').optional()
})

export const updateCategorySchema = z.object({
  name: z.string().min(1, '카테고리 이름을 입력해주세요.').max(50, '카테고리 이름은 50자 이하여야 합니다.').optional(),
  description: z.string().max(200, '설명은 200자 이하여야 합니다.').optional()
})

export const reactionSchema = z.object({
  type: z.enum(['LIKE', 'DISLIKE'], { errorMap: () => ({ message: '유효하지 않은 반응 타입입니다.' }) }),
  postId: z.string().optional(),
  commentId: z.string().optional()
}).refine(data => data.postId || data.commentId, {
  message: 'postId 또는 commentId가 필요합니다.'
})

export const updateProfileSchema = z.object({
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다.').max(20, '닉네임은 20자 이하여야 합니다.').optional(),
  profileImage: z.string().optional().nullable()
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
  newPassword: z.string().min(6, '새 비밀번호는 6자 이상이어야 합니다.'),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: '새 비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword']
})

export const createCommentSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해주세요.').max(1000, '댓글은 1000자 이하여야 합니다.'),
  postId: z.string(),
  parentId: z.string().optional()
})