import { IReactionRepository, ReactionRepository } from '@/repositories/reaction.repository'
import { NotificationService } from '@/services/notification.service'
import { prisma } from '@/lib/db/prisma'

export class ReactionService {
  private reactionRepository: IReactionRepository
  private notificationService: NotificationService

  constructor() {
    this.reactionRepository = new ReactionRepository()
    this.notificationService = new NotificationService()
  }

  async toggleReaction(userId: string, type: string, postId?: string, commentId?: string, userNickname?: string) {
    if (!postId && !commentId) {
      throw new Error('대상이 지정되지 않았습니다.')
    }

    const existing = await this.reactionRepository.findByUserAndTarget(userId, postId, commentId)

    if (!existing) {
      const reaction = await this.reactionRepository.create({ type, userId, postId, commentId })
      
      if (type === 'LIKE') {
        await this.createLikeNotification(userId, userNickname, postId, commentId)
      }
      
      return reaction
    }

    if (existing.type === type) {
      await this.reactionRepository.delete(existing.id)
      return null
    }

    const reaction = await this.reactionRepository.update(existing.id, type)
    
    if (type === 'LIKE') {
      await this.createLikeNotification(userId, userNickname, postId, commentId)
    }
    
    return reaction
  }

  private async createLikeNotification(userId: string, userNickname: string | undefined, postId?: string, commentId?: string) {
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true }
      })
      if (post && post.authorId !== userId) {
        await this.notificationService.createLikeNotification(
          post.authorId,
          userNickname || '사용자',
          '게시글',
          postId
        )
      }
    }
    
    if (commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { post: { select: { id: true } } }
      })
      if (comment && comment.authorId !== userId) {
        await this.notificationService.createLikeNotification(
          comment.authorId,
          userNickname || '사용자',
          '댓글',
          comment.post.id
        )
      }
    }
  }

  async getReactionCounts(postId?: string, commentId?: string) {
    if (postId) {
      return this.reactionRepository.countByPost(postId)
    }
    if (commentId) {
      return this.reactionRepository.countByComment(commentId)
    }
    return { likes: 0, dislikes: 0 }
  }

  async getUserReaction(userId: string, postId?: string, commentId?: string) {
    return this.reactionRepository.findByUserAndTarget(userId, postId, commentId)
  }
}