import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { PostService } from '@/services/post.service'
import { createPostSchema } from '@/validators'

const postService = new PostService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page
    const page = parseInt(pageParam || '1', 10) || 1
    const search = req.query.search as string | undefined
    const searchType = req.query.type as string | undefined
    const categoryId = req.query.category as string | undefined

    const result = await postService.getPosts(page, 10, search, searchType, categoryId)
    return res.status(200).json(result)
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ error: '로그인이 필요합니다.' })
    }

    const validated = createPostSchema.safeParse(req.body)
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.issues[0].message })
    }

    const post = await postService.createPost(
      validated.data.title,
      validated.data.content,
      session.user.id,
      validated.data.categoryId,
      validated.data.imageUrls
    )

    return res.status(200).json(post)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}