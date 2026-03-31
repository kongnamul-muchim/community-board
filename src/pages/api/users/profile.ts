import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { UserService } from '@/services/user.service'
import { updateProfileSchema } from '@/validators'

const userService = new UserService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: '로그인이 필요합니다.' })
  }

  if (req.method === 'GET') {
    try {
      const profile = await userService.getProfile(session.user.id)
      return res.status(200).json(profile)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: '서버 오류' })
    }
  }

  if (req.method === 'PUT') {
    const validated = updateProfileSchema.safeParse(req.body)
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.issues[0].message })
    }

    try {
      const user = await userService.updateProfile(
        session.user.id,
        validated.data.nickname,
        validated.data.profileImage
      )
      return res.status(200).json({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage
      })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: '서버 오류' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}