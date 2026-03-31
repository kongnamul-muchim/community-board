import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { PostService } from '@/services/post.service'
import { updatePostSchema } from '@/validators'

const postService = new PostService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: '잘못된 요청입니다.' })
  }

  if (req.method === 'GET') {
    const post = await postService.getPostById(id)
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' })
    }
    return res.status(200).json(post)
  }

  if (req.method === 'PUT') {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ error: '로그인이 필요합니다.' })
    }

    const validated = updatePostSchema.safeParse(req.body)
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.issues[0].message })
    }

    const { title, content, categoryId, imageUrls } = validated.data

    try {
      const post = await postService.updatePost(id, title, content, session.user.id, session.user.role, categoryId, imageUrls)
      return res.status(200).json(post)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: '서버 오류' })
    }
  }

  if (req.method === 'DELETE') {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ error: '로그인이 필요합니다.' })
    }

    try {
      await postService.deletePost(id, session.user.id, session.user.role)
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