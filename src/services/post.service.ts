import { PostRepository } from '@/repositories/post.repository'

export class PostService {
  private postRepository: PostRepository

  constructor() {
    this.postRepository = new PostRepository()
  }

  async getPosts(page: number, pageSize: number, search?: string, searchType?: string, categoryId?: string) {
    const skip = (page - 1) * pageSize
    const where: Record<string, unknown> = {}

    if (search && searchType) {
      if (searchType === 'title') where.title = { contains: search }
      else if (searchType === 'content') where.content = { contains: search }
      else if (searchType === 'author') where.author = { nickname: { contains: search } }
    }

    const [posts, totalCount] = await Promise.all([
      this.postRepository.findAll({ skip, take: pageSize, where, categoryId }),
      this.postRepository.count({ ...where, ...(categoryId ? { categoryId } : {}) })
    ])

    return { posts, totalCount, totalPages: Math.ceil(totalCount / pageSize) }
  }

  async getPostById(id: string) {
    const post = await this.postRepository.findById(id)
    if (post) {
      await this.postRepository.incrementViewCount(id)
    }
    return post
  }

  async createPost(title: string, content: string, authorId: string, categoryId?: string, imageUrls?: string[]) {
    return this.postRepository.create({ 
      title, 
      content, 
      authorId, 
      categoryId,
      imageUrls: imageUrls?.length ? JSON.stringify(imageUrls) : undefined
    })
  }

  async updatePost(id: string, title: string, content: string, userId: string, userRole: string, categoryId?: string, imageUrls?: string[]) {
    const post = await this.postRepository.findById(id)
    if (!post) throw new Error('게시글을 찾을 수 없습니다.')

    if (post.authorId !== userId && userRole !== 'admin') {
      throw new Error('권한이 없습니다.')
    }

    return this.postRepository.update(id, { 
      title, 
      content, 
      categoryId,
      imageUrls: imageUrls !== undefined ? (imageUrls.length ? JSON.stringify(imageUrls) : null) : undefined
    })
  }

  async deletePost(id: string, userId: string, userRole: string) {
    const post = await this.postRepository.findById(id)
    if (!post) throw new Error('게시글을 찾을 수 없습니다.')

    if (post.authorId !== userId && userRole !== 'admin') {
      throw new Error('권한이 없습니다.')
    }

    await this.postRepository.delete(id)
  }

  async getAllPostsForAdmin(search?: string) {
    return this.postRepository.findAllForAdmin({ search })
  }
}