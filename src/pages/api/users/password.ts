import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { UserService } from '@/services/user.service'
import { changePasswordSchema } from '@/validators'

const userService = new UserService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: '로그인이 필요합니다.' })
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const validated = changePasswordSchema.safeParse(req.body)
  if (!validated.success) {
    return res.status(400).json({ error: validated.error.issues[0].message })
  }

  try {
    await userService.changePassword(
      session.user.id,
      validated.data.currentPassword,
      validated.data.newPassword
    )
    return res.status(200).json({ message: '비밀번호가 변경되었습니다.' })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: '서버 오류' })
  }
}