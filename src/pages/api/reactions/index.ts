import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { ReactionService } from '@/services/reaction.service'
import { reactionSchema } from '@/validators'

const reactionService = new ReactionService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: '로그인이 필요합니다.' })
  }

  if (req.method === 'POST') {
    const validated = reactionSchema.safeParse(req.body)
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.issues[0].message })
    }

    try {
      const reaction = await reactionService.toggleReaction(
        session.user.id,
        validated.data.type,
        validated.data.postId,
        validated.data.commentId,
        session.user.name
      )
      return res.status(200).json({ reaction, toggled: !!reaction })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: '서버 오류' })
    }
  }

  if (req.method === 'GET') {
    const { postId, commentId } = req.query
    const postIdStr = typeof postId === 'string' ? postId : undefined
    const commentIdStr = typeof commentId === 'string' ? commentId : undefined

    if (!postIdStr && !commentIdStr) {
      return res.status(400).json({ error: 'postId 또는 commentId가 필요합니다.' })
    }

    const counts = await reactionService.getReactionCounts(postIdStr, commentIdStr)
    const userReaction = session 
      ? await reactionService.getUserReaction(session.user.id, postIdStr, commentIdStr)
      : null

    return res.status(200).json({ ...counts, userReaction })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}