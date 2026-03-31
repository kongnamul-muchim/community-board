import { prisma } from '@/lib/db/prisma'
import { User, Post, Comment } from '@prisma/client'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByNickname(nickname: string): Promise<User | null>
  create(data: { email: string; password: string; nickname: string }): Promise<User>
  findAll(): Promise<User[]>
  delete(id: string): Promise<void>
  updateRole(id: string, role: string): Promise<User>
  updateProfile(id: string, data: { nickname?: string; profileImage?: string }): Promise<User>
  updatePassword(id: string, password: string): Promise<User>
  findPostsByUserId(userId: string, options?: { skip?: number; take?: number }): Promise<Post[]>
  countPostsByUserId(userId: string): Promise<number>
  findCommentsByUserId(userId: string, options?: { skip?: number; take?: number }): Promise<(Comment & { post: { id: string; title: string } })[]>
  countCommentsByUserId(userId: string): Promise<number>
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } })
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { nickname } })
  }

  async create(data: { email: string; password: string; nickname: string }): Promise<User> {
    return prisma.user.create({ data })
  }

  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }

  async updateRole(id: string, role: string): Promise<User> {
    return prisma.user.update({ where: { id }, data: { role } })
  }

  async updateProfile(id: string, data: { nickname?: string; profileImage?: string }): Promise<User> {
    return prisma.user.update({ where: { id }, data })
  }

  async updatePassword(id: string, password: string): Promise<User> {
    return prisma.user.update({ where: { id }, data: { password } })
  }

  async findPostsByUserId(userId: string, options?: { skip?: number; take?: number }): Promise<Post[]> {
    return prisma.post.findMany({
      where: { authorId: userId },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { comments: true, reactions: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: options?.skip ?? 0,
      take: options?.take ?? 10
    })
  }

  async countPostsByUserId(userId: string): Promise<number> {
    return prisma.post.count({ where: { authorId: userId } })
  }

  async findCommentsByUserId(userId: string, options?: { skip?: number; take?: number }): Promise<(Comment & { post: { id: string; title: string } })[]> {
    return prisma.comment.findMany({
      where: { authorId: userId },
      include: {
        post: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: options?.skip ?? 0,
      take: options?.take ?? 10
    }) as Promise<(Comment & { post: { id: string; title: string } })[]>
  }

  async countCommentsByUserId(userId: string): Promise<number> {
    return prisma.comment.count({ where: { authorId: userId } })
  }
}