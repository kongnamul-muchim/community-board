import type { NextApiRequest, NextApiResponse } from 'next'
import { UserService } from '@/services/user.service'
import { signUpSchema } from '@/validators'

const userService = new UserService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const validated = signUpSchema.safeParse(req.body)
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.issues[0].message })
    }

    const { email, password, nickname } = validated.data

    const user = await userService.signUp(email, password, nickname)

    return res.status(200).json({
      id: user.id,
      email: user.email,
      nickname: user.nickname
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
}