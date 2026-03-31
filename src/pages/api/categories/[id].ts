import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { CategoryService } from '@/services/category.service'
import { updateCategorySchema } from '@/validators'

const categoryService = new CategoryService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') {
    return res.status(400).json({ error: '잘못된 요청입니다.' })
  }

  if (req.method === 'GET') {
    const category = await categoryService.getCategoryById(id)
    if (!category) {
      return res.status(404).json({ error: '카테고리를 찾을 수 없습니다.' })
    }
    return res.status(200).json(category)
  }

  if (req.method === 'PUT') {
    const session = await getServerSession(req, res, authOptions)
    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' })
    }

    const validated = updateCategorySchema.safeParse(req.body)
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.issues[0].message })
    }

    try {
      const category = await categoryService.updateCategory(
        id,
        validated.data.name,
        validated.data.description
      )
      return res.status(200).json(category)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: '서버 오류' })
    }
  }

  if (req.method === 'DELETE') {
    const session = await getServerSession(req, res, authOptions)
    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' })
    }

    try {
      await categoryService.deleteCategory(id)
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