import { prisma } from '@/lib/db/prisma'
import { Reaction } from '@prisma/client'

export interface IReactionRepository {
  findByUserAndTarget(userId: string, postId?: string, commentId?: string): Promise<Reaction | null>
  create(data: { type: string; userId: string; postId?: string; commentId?: string }): Promise<Reaction>
  update(id: string, type: string): Promise<Reaction>
  delete(id: string): Promise<void>
  countByPost(postId: string): Promise<{ likes: number; dislikes: number }>
  countByComment(commentId: string): Promise<{ likes: number; dislikes: number }>
}

export class ReactionRepository implements IReactionRepository {
  async findByUserAndTarget(userId: string, postId?: string, commentId?: string): Promise<Reaction | null> {
    return prisma.reaction.findFirst({
      where: { userId, postId: postId ?? null, commentId: commentId ?? null }
    })
  }

  async create(data: { type: string; userId: string; postId?: string; commentId?: string }): Promise<Reaction> {
    return prisma.reaction.create({ data })
  }

  async update(id: string, type: string): Promise<Reaction> {
    return prisma.reaction.update({ where: { id }, data: { type } })
  }

  async delete(id: string): Promise<void> {
    await prisma.reaction.delete({ where: { id } })
  }

  async countByPost(postId: string): Promise<{ likes: number; dislikes: number }> {
    const [likes, dislikes] = await Promise.all([
      prisma.reaction.count({ where: { postId, type: 'LIKE' } }),
      prisma.reaction.count({ where: { postId, type: 'DISLIKE' } })
    ])
    return { likes, dislikes }
  }

  async countByComment(commentId: string): Promise<{ likes: number; dislikes: number }> {
    const [likes, dislikes] = await Promise.all([
      prisma.reaction.count({ where: { commentId, type: 'LIKE' } }),
      prisma.reaction.count({ where: { commentId, type: 'DISLIKE' } })
    ])
    return { likes, dislikes }
  }
}