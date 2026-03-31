'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  authorId: string
  viewCount: number
  createdAt: string
  imageUrls: string | null
  category: { id: string; name: string } | null
  author: { id: string; nickname: string }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  authorId: string
  author?: { id: string; nickname: string }
  replies?: Comment[]
}

interface ReactionCounts {
  likes: number
  dislikes: number
  userReaction: { type: string } | null
}

export default function PostDetailPage() {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [reactions, setReactions] = useState<ReactionCounts>({ likes: 0, dislikes: 0, userReaction: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const postId = searchParams.get('id') || ''
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if (!postId) {
      setError('잘못된 접근입니다.')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const [postRes, commentsRes, reactionsRes] = await Promise.all([
          fetch(`/api/posts/${postId}`),
          fetch(`/api/comments?postId=${postId}`),
          fetch(`/api/reactions?postId=${postId}`)
        ])

        if (!postRes.ok) {
          setError('게시글을 찾을 수 없습니다.')
          return
        }

        const postData = await postRes.json()
        const commentsData = await commentsRes.json()
        const reactionsData = await reactionsRes.json()

        setPost(postData)
        setComments(commentsData)
        setReactions(reactionsData)
      } catch {
        setError('데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [postId])

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/')
    }
  }

  const handleReaction = async (type: 'LIKE' | 'DISLIKE') => {
    if (!session) return

    const res = await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, postId })
    })

    if (res.ok) {
      const data = await res.json()
      setReactions(prev => ({
        likes: data.toggled ? (type === 'LIKE' ? prev.likes + 1 : prev.likes - 1) : prev.likes,
        dislikes: data.toggled ? (type === 'DISLIKE' ? prev.dislikes + 1 : prev.dislikes - 1) : prev.dislikes,
        userReaction: data.reaction ? { type } : null
      }))
      const reactionsRes = await fetch(`/api/reactions?postId=${postId}`)
      if (reactionsRes.ok) {
        setReactions(await reactionsRes.json())
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{error || '게시글을 찾을 수 없습니다.'}</h1>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">목록으로 돌아가기</Link>
        </div>
      </div>
    )
  }

  const isOwner = session?.user?.id === post.authorId
  const isAdmin = session?.user?.role === 'admin'
  const imageUrls = post.imageUrls ? JSON.parse(post.imageUrls) : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {post.category && (
                  <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
                    {post.category.name}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{post.title}</h1>
            </div>
            {(isOwner || isAdmin) && (
              <div className="flex gap-2">
                <Link href={`/edit?id=${post.id}`} className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                  수정
                </Link>
                <button onClick={handleDelete} className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                  삭제
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <span className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {post.author?.nickname?.charAt(0) || '?'}
              </div>
              {post.author?.nickname}
            </span>
            <span>{new Date(post.createdAt).toLocaleString()}</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.viewCount}
            </span>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{post.content}</p>
          </div>

          {imageUrls.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {imageUrls.map((url: string, index: number) => (
                <img
                  key={index}
                  src={url}
                  alt={`첨부 이미지 ${index + 1}`}
                  className="rounded-lg object-cover w-full h-48"
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleReaction('LIKE')}
              disabled={!session}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                reactions.userReaction?.type === 'LIKE'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } ${!session ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5" fill={reactions.userReaction?.type === 'LIKE' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span className="font-medium">{reactions.likes}</span>
            </button>
            <button
              onClick={() => handleReaction('DISLIKE')}
              disabled={!session}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                reactions.userReaction?.type === 'DISLIKE'
                  ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } ${!session ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5" fill={reactions.userReaction?.type === 'DISLIKE' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
              <span className="font-medium">{reactions.dislikes}</span>
            </button>
          </div>
        </div>

        <CommentsSection postId={postId} comments={comments} setComments={setComments} />

        <div className="mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            목록으로
          </Link>
        </div>
      </div>
    </div>
  )
}

function CommentsSection({
  postId,
  comments,
  setComments
}: {
  postId: string
  comments: Comment[]
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>
}) {
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const { data: session } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, postId })
    })

    const data = await res.json()
    if (res.ok) {
      setComments([data, ...comments])
      setContent('')
    }
  }

  const handleReply = async (parentId: string) => {
    if (!session || !replyContent.trim()) return

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyContent, postId, parentId })
    })

    const data = await res.json()
    if (res.ok) {
      setComments(comments.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies || []), data] }
        }
        return c
      }))
      setReplyTo(null)
      setReplyContent('')
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(comments.filter(c => c.id !== commentId))
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">댓글 {comments.length}개</h2>

      {session ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field h-24 resize-none"
            placeholder="댓글을 입력하세요..."
            required
          />
          <div className="flex justify-end mt-2">
            <button type="submit" className="btn-primary text-sm">
              댓글 등록
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center py-4">
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">로그인</Link> 후 댓글을 작성할 수 있습니다.
        </p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white text-sm font-medium">
                  {comment.author?.nickname?.charAt(0) || '?'}
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{comment.author?.nickname || '알 수 없음'}</span>
                  <span className="text-gray-400 text-sm ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
              </div>
              {session && comment.author && (session.user.id === comment.authorId || session.user.role === 'admin') && (
                <button onClick={() => handleDelete(comment.id)} className="text-red-500 text-sm hover:underline">삭제</button>
              )}
            </div>
            <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>

            {session && (
              <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="text-sm text-gray-500 dark:text-gray-400 mt-2 hover:underline">
                답글
              </button>
            )}

            {replyTo === comment.id && (
              <div className="mt-3 ml-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="input-field h-16 resize-none text-sm"
                  placeholder="답글을 입력하세요..."
                />
                <div className="mt-2 flex gap-2">
                  <button onClick={() => handleReply(comment.id)} className="btn-primary text-sm py-1">등록</button>
                  <button onClick={() => setReplyTo(null)} className="text-gray-500 text-sm hover:underline">취소</button>
                </div>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 ml-4 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white text-xs font-medium">
                          {reply.author?.nickname?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{reply.author?.nickname || '알 수 없음'}</span>
                        <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleString()}</span>
                      </div>
                      {session && reply.author && (session.user.id === reply.authorId || session.user.role === 'admin') && (
                        <button onClick={() => handleDelete(reply.id)} className="text-red-500 text-xs hover:underline">삭제</button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}