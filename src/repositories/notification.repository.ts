import { prisma } from '@/lib/db/prisma'
import { Notification } from '@prisma/client'

export interface INotificationRepository {
  findByUserId(userId: string, limit?: number): Promise<Notification[]>
  findById(id: string): Promise<Notification | null>
  create(data: { type: string; message: string; userId: string; relatedPostId?: string }): Promise<Notification>
  markAsRead(id: string): Promise<Notification>
  markAllAsRead(userId: string): Promise<void>
  countUnread(userId: string): Promise<number>
}

export class NotificationRepository implements INotificationRepository {
  async findByUserId(userId: string, limit = 20): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({ where: { id } })
  }

  async create(data: { type: string; message: string; userId: string; relatedPostId?: string }): Promise<Notification> {
    return prisma.notification.create({ data })
  }

  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({ where: { id }, data: { isRead: true } })
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })
  }

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false }
    })
  }
}