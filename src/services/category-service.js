import { categoryModel } from "../db";

export const categories = {
  100: "소설", //
  110: "시/에세이",
  120: "인문",
  130: "가정/생활/요리",
  140: "건강",
  150: "취미/레저",
  160: "경제/경영",
  170: "자기계발", //
  180: "사회",
  190: "역사/문화",
  200: "종교",
  210: "예술/대중문화",
  220: "학습/참고서",
  230: "국어/외국어",
  240: "사전",
  250: "과학/공학", //
  260: "취업/수험서",
  270: "여행/지도",
  280: "컴퓨터/IT", //
  290: "잡지",
  300: "청소년",
  320: "어린이",
  330: "만화", //
  340: "해외도서",
};

class CategoryService {
  constructor(categoryModel) {
    this.categoryModel = categoryModel;
  }

  // 카테고리 추가
  async addCategory(name) {
    // 중복 확인
    const category = await this.categoryModel.findByName(name);
    if (category) {
      throw new Error("이미 존재하는 카테고리입니다.");
    }

    const createdNewCategory = await this.categoryModel.create(name); //DB저장

    return createdNewCategory;
  }

  // 카테고리 이름으로 조회
  async findName(name) {
    const category = categoryModel.findByName(name);
    return category;
  }

  // 카테고리 전체 조회
  async getCategories() {
    const categories = await this.categoryModel.findAll();
    if (!categories) {
      throw new Error("아직 생성된 카테고리가 없습니다.");
    }
    return categories;
  }

  // categoryId로 책 찾기
  async getFindById(categoryId) {
    const catgory = await this.categoryModel.findById(categoryId);
    return catgory;
  }

  //삭제
  async deleteCategory(name) {
    const category = await this.categoryModel.delete(name);

    return category;
  }

  //업데이트
  async setCategory(name, toUpdate) {
    // 업데이트하고자 하는 카테고리가 DB내에 존재하는지 확인
    let category = await this.categoryModel.findByName(name);

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!category) {
      throw new Error(
        "해당 카테고리는 존재하지 않습니다. 다시 한번 확인해주시기 바랍니다."
      );
    }

    category = await this.categoryModel.update({
      name,
      update: toUpdate,
    });

    return category;
  }
}

const categoryService = new CategoryService(categoryModel);

export { categoryService };
