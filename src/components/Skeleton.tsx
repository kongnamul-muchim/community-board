'use client'

export function PostCardSkeleton() {
  return (
    <div className="card p-4">
      <div className="skeleton h-4 w-3/4 mb-3"></div>
      <div className="skeleton h-3 w-full mb-2"></div>
      <div className="skeleton h-3 w-2/3 mb-4"></div>
      <div className="flex gap-4">
        <div className="skeleton h-3 w-16"></div>
        <div className="skeleton h-3 w-16"></div>
        <div className="skeleton h-3 w-16"></div>
      </div>
    </div>
  )
}

export function PostDetailSkeleton() {
  return (
    <div className="card p-6">
      <div className="skeleton h-8 w-3/4 mb-4"></div>
      <div className="flex gap-4 mb-6">
        <div className="skeleton h-4 w-24"></div>
        <div className="skeleton h-4 w-24"></div>
        <div className="skeleton h-4 w-24"></div>
      </div>
      <div className="space-y-3">
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-3/4"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-2/3"></div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="skeleton w-20 h-20 rounded-full"></div>
        <div>
          <div className="skeleton h-6 w-32 mb-2"></div>
          <div className="skeleton h-4 w-48"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="skeleton h-10 w-full"></div>
        <div className="skeleton h-10 w-full"></div>
        <div className="skeleton h-10 w-full"></div>
      </div>
    </div>
  )
}

export function CommentSkeleton() {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start gap-3">
        <div className="skeleton w-10 h-10 rounded-full"></div>
        <div className="flex-1">
          <div className="skeleton h-4 w-24 mb-2"></div>
          <div className="skeleton h-4 w-full mb-1"></div>
          <div className="skeleton h-4 w-3/4"></div>
        </div>
      </div>
    </div>
  )
}