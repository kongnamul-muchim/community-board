'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function EditPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  
  const postId = searchParams?.get('id') || ''

  useEffect(() => {
    if (!postId) {
      setError('잘못된 접근입니다.')
      setLoading(false)
      return
    }

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status !== 'authenticated') return

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || '게시글을 찾을 수 없습니다.')
          setLoading(false)
          return
        }

        if (data.authorId !== session.user.id && session.user.role !== 'admin') {
          setError('수정 권한이 없습니다.')
          setLoading(false)
          return
        }

        setTitle(data.title)
        setContent(data.content)
      } catch {
        setError('게시글을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId, session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '수정에 실패했습니다.')
        return
      }

      router.push(`/post?id=${postId}`)
    } catch {
      setError('수정에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">로딩중...</div>
  }

  if (error && !title) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/" className="text-blue-500 hover:underline">목록으로</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded shadow p-6">
          <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>
          
          {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 font-medium">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
                maxLength={100}
              />
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium">내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border rounded px-3 py-2 h-64 resize-none"
                required
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? '수정중...' : '수정'}
              </button>
              <Link href={`/post?id=${postId}`} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">취소</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}