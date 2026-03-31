'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type User = { id: string; email: string; nickname: string; role: string; createdAt: string }
type Post = { id: string; title: string; createdAt: string; author: { nickname: string }; _count: { comments: number } }
type Comment = { id: string; content: string; createdAt: string; author: { nickname: string }; post: { id: string; title: string } }

export default function AdminPage() {
  const [tab, setTab] = useState<'users' | 'posts' | 'comments'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/')
    }
  }, [status, session, router])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === 'users') {
        const res = await fetch('/api/admin/users')
        const data = await res.json()
        if (res.ok) setUsers(data)
      } else if (tab === 'posts') {
        const res = await fetch(`/api/admin/posts${search ? `?search=${search}` : ''}`)
        const data = await res.json()
        if (res.ok) setPosts(data)
      } else {
        const res = await fetch('/api/admin/comments')
        const data = await res.json()
        if (res.ok) setComments(data)
      }
    } finally {
      setLoading(false)
    }
  }, [tab, search])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'admin') return
    fetchData()
  }, [tab, status, session, fetchData])

  const handleRoleChange = async (userId: string, role: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, role })
    })
    if (res.ok) fetchData()
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId })
    })
    if (res.ok) fetchData()
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
    if (res.ok) fetchData()
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) fetchData()
  }

  if (status === 'loading' || !session || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">관리자 대시보드</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">사이트 관리 및 모니터링</p>
          </div>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            메인으로
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">총 회원</p>
                <p className="text-3xl font-bold mt-1">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">총 게시글</p>
                <p className="text-3xl font-bold mt-1">{posts.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">총 댓글</p>
                <p className="text-3xl font-bold mt-1">{comments.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {(['users', 'posts', 'comments'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch('') }}
              className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                tab === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t === 'users' ? '회원 관리' : t === 'posts' ? '게시글 관리' : '댓글 관리'}
            </button>
          ))}
        </div>

        {tab === 'posts' && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              placeholder="제목, 내용, 작성자 검색..."
              className="input-field flex-1"
            />
            <button onClick={fetchData} className="btn-secondary">검색</button>
          </div>
        )}

        {loading ? (
          <div className="card p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">불러오는 중...</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              {tab === 'users' && (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-4 text-left text-gray-700 dark:text-gray-300 font-medium">닉네임</th>
                      <th className="p-4 text-left text-gray-700 dark:text-gray-300 font-medium">이메일</th>
                      <th className="p-4 text-center text-gray-700 dark:text-gray-300 font-medium">등급</th>
                      <th className="p-4 text-center text-gray-700 dark:text-gray-300 font-medium">가입일</th>
                      <th className="p-4 text-center text-gray-700 dark:text-gray-300 font-medium">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-4 text-gray-900 dark:text-white">{user.nickname}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                        <td className="p-4 text-center">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="member">일반</option>
                            <option value="admin">관리자</option>
                          </select>
                        </td>
                        <td className="p-4 text-center text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:underline">삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'posts' && (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-4 text-left text-gray-700 dark:text-gray-300 font-medium">제목</th>
                      <th className="p-4 text-center text-gray-700 dark:text-gray-300 font-medium">작성자</th>
                      <th className="p-4 text-center text-gray-700 dark:text-gray-300 font-medium">댓글</th>
                      <th className="p-4 text-center text-gray-700 dark:text-gray-300 font-medium">작성일</th>
                      <th className="p-4 text-center text-gray-700 dark:text-gray-300 font-medium">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-4">
                          <Link href={`/post?id=${post.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">{post.title}</Link>
                        </td>
                        <td className="p-4 text-center text-gray-900 dark:text-white">{post.author.nickname}</td>
                        <td className="p-4 text-center text-gray-600 dark:text-gray-400">{post._count.comments}</td>
                        <td className="p-4 text-center text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:underline">삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'comments' && (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="p-4 text-left text-gray-700 dark:text-gray-300 font-medium">내용</th>
                      <th className="p-4 text-center text-gray-700 dark:text-gray-300 font-medium">작성자</th>
                      <th className="p-4 text-left text-gray-700 dark:text-gray-300 font-medium">게시글</th>
                      <th className="p-4 text-center text-gray-700 dark:text-gray-300 font-medium">작성일</th>
                      <th className="p-4 text-center text-gray-700 dark:text-gray-300 font-medium">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {comments.map((comment) => (
                      <tr key={comment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-4 max-w-xs truncate text-gray-900 dark:text-white">{comment.content}</td>
                        <td className="p-4 text-center text-gray-900 dark:text-white">{comment.author.nickname}</td>
                        <td className="p-4">
                          <Link href={`/post?id=${comment.post.id}`} className="text-blue-600 dark:text-blue-400 hover:underline truncate block max-w-xs">
                            {comment.post.title}
                          </Link>
                        </td>
                        <td className="p-4 text-center text-gray-500 dark:text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:underline">삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}