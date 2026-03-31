'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Post = {
  id: string
  title: string
  content: string
  createdAt: string
  category: { id: string; name: string } | null
  _count: { comments: number; reactions: number }
}

type Comment = {
  id: string
  content: string
  createdAt: string
  post: { id: string; title: string }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'posts' | 'comments'>('profile')
  const [profile, setProfile] = useState<{ nickname: string; email: string; profileImage: string | null } | null>(null)
  const [posts, setPosts] = useState<{ posts: Post[]; totalPages: number }>({ posts: [], totalPages: 1 })
  const [comments, setComments] = useState<{ comments: Comment[]; totalPages: number }>({ comments: [], totalPages: 1 })
  const [loading, setLoading] = useState(true)

  const [nickname, setNickname] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchProfile()
    }
  }, [session])

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts()
    if (activeTab === 'comments') fetchComments()
  }, [activeTab])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setNickname(data.nickname)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    const res = await fetch('/api/users/posts')
    if (res.ok) {
      setPosts(await res.json())
    }
  }

  const fetchComments = async () => {
    const res = await fetch('/api/users/comments')
    if (res.ok) {
      setComments(await res.json())
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }

      setProfile(data)
      setSuccess('프로필이 업데이트되었습니다.')
    } catch {
      setError('프로필 업데이트에 실패했습니다.')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      const res = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }

      setSuccess('비밀번호가 변경되었습니다.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setError('비밀번호 변경에 실패했습니다.')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">마이페이지</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            프로필
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'password'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            비밀번호 변경
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'posts'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            내 게시글
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'comments'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            내 댓글
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {activeTab === 'profile' && profile && (
          <div className="card p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="input-field bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="input-field"
                  minLength={2}
                  maxLength={20}
                />
              </div>
              <button type="submit" className="btn-primary">
                저장
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="card p-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-primary">
                비밀번호 변경
              </button>
            </form>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.posts.length === 0 ? (
              <div className="card p-6 text-center text-gray-500 dark:text-gray-400">
                작성한 게시글이 없습니다.
              </div>
            ) : (
              posts.posts.map((post) => (
                <Link key={post.id} href={`/post?id=${post.id}`} className="card card-hover p-4 block">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{post.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.category && (
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                            {post.category.name}
                          </span>
                        )}
                        <span>댓글 {post._count.comments}</span>
                        <span>추천 {post._count.reactions}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            {comments.comments.length === 0 ? (
              <div className="card p-6 text-center text-gray-500 dark:text-gray-400">
                작성한 댓글이 없습니다.
              </div>
            ) : (
              comments.comments.map((comment) => (
                <Link key={comment.id} href={`/post?id=${comment.post.id}`} className="card card-hover p-4 block">
                  <p className="text-gray-900 dark:text-white">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    <span>« {comment.post.title}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}