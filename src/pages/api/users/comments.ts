import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { UserService } from '@/services/user.service'

const userService = new UserService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: '로그인이 필요합니다.' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const pageParam = req.query.page as string | undefined
  const page = parseInt(pageParam || '1', 10) || 1

  try {
    const result = await userService.getMyComments(session.user.id, page, 10)
    return res.status(200).json(result)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: '서버 오류' })
  }
}