import { model } from "mongoose";
import { CategorySchema } from "../schemas/category-schema";

const Category = model("categories", CategorySchema);

export class CategoryModel {
  // 1. 카테고리 생성
  async create(name) {
    const createdCategory = await Category.create({ name });
    return createdCategory;
  }

  // 2. 카테고리 전체조회
  async findAll() {
    const categories = await Category.find({});
    return categories;
  }

  // 카테고리 아이디로 조회
  async findById(categoryId) {
    const category = await Category.findOne({ _id: categoryId });
    return category;
  }

  // 카테고리 이름로 조회
  async findByName(name) {
    const category = await Category.findOne({ name });
    return category;
  }

  // 4. 카테고리 수정
  async update({ name, update }) {
    const filter = { name };
    const option = { returnOriginal: false };
    const updatedCategory = await Category.findOneAndUpdate(
      filter,
      update,
      option
    );
    return updatedCategory;
  }

  // 5. 카테고리 삭제
  async delete(name) {
    const category = await Category.findOneAndDelete({ name });
    return category;
  }
}

const categoryModel = new CategoryModel();

export { categoryModel };
