import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/auth'

export default NextAuth(authOptions)