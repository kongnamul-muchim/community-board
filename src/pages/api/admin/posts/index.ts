import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { PostService } from '@/services/post.service'

const postService = new PostService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { search } = req.query
  const posts = await postService.getAllPostsForAdmin(search as string | undefined)

  return res.status(200).json(posts)
}