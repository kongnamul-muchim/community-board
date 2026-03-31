import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { NotificationService } from '@/services/notification.service'

const notificationService = new NotificationService()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: '로그인이 필요합니다.' })
  }

  if (req.method === 'GET') {
    const limitParam = req.query.limit
    const limit = typeof limitParam === 'string' ? parseInt(limitParam, 10) : 20

    const notifications = await notificationService.getNotifications(session.user.id, limit)
    const unreadCount = await notificationService.getUnreadCount(session.user.id)

    return res.status(200).json({ notifications, unreadCount })
  }

  if (req.method === 'PUT') {
    const { notificationId, markAll } = req.body

    if (markAll) {
      await notificationService.markAllAsRead(session.user.id)
      return res.status(200).json({ message: '모든 알림을 읽음 처리했습니다.' })
    }

    if (!notificationId) {
      return res.status(400).json({ error: '알림 ID가 필요합니다.' })
    }

    try {
      await notificationService.markAsRead(notificationId, session.user.id)
      return res.status(200).json({ message: '읽음 처리되었습니다.' })
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: '서버 오류' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}