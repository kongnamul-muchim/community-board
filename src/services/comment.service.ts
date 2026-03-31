import { ICommentRepository, CommentRepository } from '@/repositories/comment.repository'
import { NotificationService } from '@/services/notification.service'
import { prisma } from '@/lib/db/prisma'

export class CommentService {
  private notificationService: NotificationService

  constructor(private commentRepository: ICommentRepository = new CommentRepository()) {
    this.notificationService = new NotificationService()
  }

  async getCommentsByPostId(postId: string) {
    return this.commentRepository.findByPostId(postId)
  }

  async createComment(content: string, authorId: string, postId: string, parentId?: string, authorNickname?: string) {
    const comment = await this.commentRepository.create({ content, authorId, postId, parentId })

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true }
    })

    if (post) {
      if (parentId) {
        const parentComment = await this.commentRepository.findById(parentId)
        if (parentComment && parentComment.authorId !== authorId) {
          await this.notificationService.createReplyNotification(
            parentComment.authorId,
            authorNickname || '사용자',
            postId
          )
        }
      } else {
        if (post.authorId !== authorId) {
          await this.notificationService.createCommentNotification(
            post.authorId,
            authorNickname || '사용자',
            postId,
            post.title
          )
        }
      }
    }

    return comment
  }

  async deleteComment(id: string, userId: string, userRole: string) {
    const comment = await this.commentRepository.findById(id)
    if (!comment) throw new Error('댓글을 찾을 수 없습니다.')

    if (comment.authorId !== userId && userRole !== 'admin') {
      throw new Error('권한이 없습니다.')
    }

    await this.commentRepository.delete(id)
  }

  async getAllCommentsForAdmin() {
    return this.commentRepository.findAllForAdmin()
  }
}