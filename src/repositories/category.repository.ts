import { prisma } from '@/lib/db/prisma'
import { Category } from '@prisma/client'

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>
  findAll(): Promise<Category[]>
  create(data: { name: string; description?: string }): Promise<Category>
  update(id: string, data: { name?: string; description?: string }): Promise<Category>
  delete(id: string): Promise<void>
}

export class CategoryRepository implements ICategoryRepository {
  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } })
  }

  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { createdAt: 'asc' }
    })
  }

  async create(data: { name: string; description?: string }): Promise<Category> {
    return prisma.category.create({ data })
  }

  async update(id: string, data: { name?: string; description?: string }): Promise<Category> {
    return prisma.category.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } })
  }
}