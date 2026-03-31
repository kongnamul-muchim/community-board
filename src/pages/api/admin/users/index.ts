import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { UserService } from '@/services/user.service'

const userService = new UserService()

async function checkAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || session.user.role !== 'admin') {
    return null
  }
  return session
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const session = await checkAdmin(req, res)
    if (!session) {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' })
    }

    const users = await userService.getAllUsers()
    return res.status(200).json(users)
  }

  if (req.method === 'PUT') {
    const session = await checkAdmin(req, res)
    if (!session) {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' })
    }

    const { id, role } = req.body

    try {
      const user = await userService.updateRole(id, role)
      return res.status(200).json(user)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: '서버 오류' })
    }
  }

  if (req.method === 'DELETE') {
    const session = await checkAdmin(req, res)
    if (!session) {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' })
    }

    const { id } = req.body

    try {
      await userService.deleteUser(id)
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