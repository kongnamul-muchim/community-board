import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { CommentService } from '@/services/comment.service'
import { createCommentSchema } from '@/validators'

const commentService = new CommentService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { postId } = req.query
    if (!postId || typeof postId !== 'string') {
      return res.status(400).json({ error: 'postId가 필요합니다.' })
    }

    const comments = await commentService.getCommentsByPostId(postId)
    return res.status(200).json(comments)
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ error: '로그인이 필요합니다.' })
    }

    const validated = createCommentSchema.safeParse(req.body)
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.issues[0].message })
    }

    const comment = await commentService.createComment(
      validated.data.content,
      session.user.id,
      validated.data.postId,
      validated.data.parentId,
      session.user.name
    )

    return res.status(200).json(comment)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}