import { INotificationRepository, NotificationRepository } from '@/repositories/notification.repository'

export class NotificationService {
  private notificationRepository: INotificationRepository

  constructor() {
    this.notificationRepository = new NotificationRepository()
  }

  async getNotifications(userId: string, limit?: number) {
    return this.notificationRepository.findByUserId(userId, limit)
  }

  async getUnreadCount(userId: string) {
    return this.notificationRepository.countUnread(userId)
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findById(notificationId)
    if (!notification) {
      throw new Error('알림을 찾을 수 없습니다.')
    }
    if (notification.userId !== userId) {
      throw new Error('권한이 없습니다.')
    }
    return this.notificationRepository.markAsRead(notificationId)
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.markAllAsRead(userId)
  }

  async createCommentNotification(postAuthorId: string, commenterNickname: string, postId: string, postTitle: string) {
    if (!postAuthorId) return
    
    await this.notificationRepository.create({
      type: 'COMMENT',
      message: `${commenterNickname}님이 "${postTitle}"에 댓글을 달았습니다.`,
      userId: postAuthorId,
      relatedPostId: postId
    })
  }

  async createReplyNotification(commentAuthorId: string, replierNickname: string, postId: string) {
    if (!commentAuthorId) return
    
    await this.notificationRepository.create({
      type: 'REPLY',
      message: `${replierNickname}님이 회원님의 댓글에 답글을 달았습니다.`,
      userId: commentAuthorId,
      relatedPostId: postId
    })
  }

  async createLikeNotification(targetAuthorId: string, likerNickname: string, targetType: string, postId: string) {
    if (!targetAuthorId) return
    
    await this.notificationRepository.create({
      type: 'LIKE',
      message: `${likerNickname}님이 회원님의 ${targetType}에 좋아요를 눌렀습니다.`,
      userId: targetAuthorId,
      relatedPostId: postId
    })
  }
}