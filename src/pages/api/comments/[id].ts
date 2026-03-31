import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { CommentService } from '@/services/comment.service'

const commentService = new CommentService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: '잘못된 요청입니다.' })
  }

  if (req.method === 'DELETE') {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ error: '로그인이 필요합니다.' })
    }

    try {
      await commentService.deleteComment(id, session.user.id, session.user.role)
      return res.status(200).json({ message: '삭제되었습니다.' })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: '서버 오류' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}