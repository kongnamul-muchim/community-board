import { ICategoryRepository, CategoryRepository } from '@/repositories/category.repository'

export class CategoryService {
  private categoryRepository: ICategoryRepository

  constructor() {
    this.categoryRepository = new CategoryRepository()
  }

  async getCategories() {
    return this.categoryRepository.findAll()
  }

  async getCategoryById(id: string) {
    return this.categoryRepository.findById(id)
  }

  async createCategory(name: string, description?: string) {
    const existing = await this.categoryRepository.findAll()
    if (existing.some(c => c.name === name)) {
      throw new Error('이미 존재하는 카테고리입니다.')
    }
    return this.categoryRepository.create({ name, description })
  }

  async updateCategory(id: string, name?: string, description?: string) {
    const category = await this.categoryRepository.findById(id)
    if (!category) {
      throw new Error('카테고리를 찾을 수 없습니다.')
    }

    if (name && name !== category.name) {
      const existing = await this.categoryRepository.findAll()
      if (existing.some(c => c.name === name)) {
        throw new Error('이미 존재하는 카테고리입니다.')
      }
    }

    return this.categoryRepository.update(id, { name, description })
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.findById(id)
    if (!category) {
      throw new Error('카테고리를 찾을 수 없습니다.')
    }

    await this.categoryRepository.delete(id)
  }
}