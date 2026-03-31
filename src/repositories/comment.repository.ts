import { prisma } from '@/lib/db/prisma'
import { Comment } from '@prisma/client'

export interface ICommentRepository {
  findById(id: string): Promise<Comment | null>
  findByPostId(postId: string): Promise<Comment[]>
  findAllForAdmin(options?: { take?: number }): Promise<Comment[]>
  create(data: { content: string; authorId: string; postId: string; parentId?: string }): Promise<Comment>
  delete(id: string): Promise<void>
}

export class CommentRepository implements ICommentRepository {
  async findById(id: string): Promise<Comment | null> {
    return prisma.comment.findUnique({ where: { id } })
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        author: { select: { id: true, nickname: true } },
        replies: {
          include: {
            author: { select: { id: true, nickname: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async create(data: { content: string; authorId: string; postId: string; parentId?: string }): Promise<Comment & { author: { id: string; nickname: string } }> {
    return prisma.comment.create({
      data,
      include: {
        author: { select: { id: true, nickname: true } }
      }
    }) as Comment & { author: { id: string; nickname: string } }
  }

  async delete(id: string): Promise<void> {
    await prisma.comment.delete({ where: { id } })
  }

  async findAllForAdmin(options?: { take?: number }): Promise<Comment[]> {
    return prisma.comment.findMany({
      include: {
        author: { select: { id: true, nickname: true } },
        post: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: options?.take ?? 100
    })
  }
}