import { prisma } from '@/lib/db/prisma'
import { Post } from '@prisma/client'

export interface IPostRepository {
  findById(id: string): Promise<Post | null>
  findAll(options?: { skip?: number; take?: number; where?: Record<string, unknown>; categoryId?: string }): Promise<Post[]>
  count(where?: Record<string, unknown>): Promise<number>
  create(data: { title: string; content: string; authorId: string; categoryId?: string; imageUrls?: string }): Promise<Post>
  update(id: string, data: { title?: string; content?: string; categoryId?: string; imageUrls?: string }): Promise<Post>
  delete(id: string): Promise<void>
  incrementViewCount(id: string): Promise<void>
  findAllForAdmin(options?: { search?: string; take?: number }): Promise<Post[]>
}

export class PostRepository implements IPostRepository {
  async findById(id: string): Promise<Post | null> {
    return prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, nickname: true } },
        category: { select: { id: true, name: true } }
      }
    })
  }

  async findAll(options?: { skip?: number; take?: number; where?: Record<string, unknown>; categoryId?: string }): Promise<Post[]> {
    const where: Record<string, unknown> = options?.where || {}
    if (options?.categoryId) {
      where.categoryId = options.categoryId
    }

    return prisma.post.findMany({
      where,
      include: {
        author: { select: { nickname: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { comments: true, reactions: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: options?.skip ?? 0,
      take: options?.take ?? 10
    })
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return prisma.post.count({ where })
  }

  async create(data: { title: string; content: string; authorId: string; categoryId?: string; imageUrls?: string }): Promise<Post> {
    return prisma.post.create({
      data,
      include: {
        category: { select: { id: true, name: true } }
      }
    })
  }

  async update(id: string, data: { title?: string; content?: string; categoryId?: string; imageUrls?: string }): Promise<Post> {
    return prisma.post.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true } }
      }
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.post.delete({ where: { id } })
  }

  async incrementViewCount(id: string): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    })
  }

  async findAllForAdmin(options?: { search?: string; take?: number }): Promise<Post[]> {
    const where: Record<string, unknown> = options?.search ? {
      OR: [
        { title: { contains: options.search } },
        { content: { contains: options.search } },
        { author: { nickname: { contains: options.search } } }
      ]
    } : {}

    return prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, nickname: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: options?.take ?? 100
    })
  }
}