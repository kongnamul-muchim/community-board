import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import multer from 'multer'
import path from 'path'
import { promisify } from 'util'
import fs from 'fs'

const uploadDir = path.join(process.cwd(), 'public/uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, 'img-' + uniqueSuffix + ext)
  }
})

const fileFilter = (_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('허용되지 않는 파일 형식입니다.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})

const uploadMiddleware = promisify(upload.single('file'))

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: '로그인이 필요합니다.' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await (uploadMiddleware as any)(req, res)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        return res.status(400).json({ error: '파일 크기가 5MB를 초과합니다.' })
      }
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: '파일 업로드 실패' })
  }

  const file = (req as NextApiRequest & { file?: Express.Multer.File }).file
  if (!file) {
    return res.status(400).json({ error: '파일이 없습니다.' })
  }

  const imageUrl = `/uploads/${file.filename}`
  return res.status(200).json({ url: imageUrl, filename: file.filename })
}