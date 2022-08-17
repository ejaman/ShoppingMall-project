import { Router } from "express";
import { categoryService, bookService } from "../services";
import { adminRequired } from "../middlewares";
import is from "@sindresorhus/is";

const categoryRouter = Router();

//  전체 카테고리 조회
categoryRouter.get("/category/categorylist", async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    res.status(200).json(categories); // json 형태로 보내줌
  } catch (err) {
    next(err);
  }
});

// 카테고리 아이디로 얻기
categoryRouter.get("/category/:id", async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryService.getFindById(categoryId);
    res.status(200).json(category); // json 형태로 보내줌
  } catch (err) {
    next(err);
  }
});

// 카테고리 추가
categoryRouter.post(
  "/category/:catg",
  adminRequired,
  async (req, res, next) => {
    try {
      const { catg } = req.params;
      const addedCategory = await categoryService.addCategory(catg);

      res.status(201).json(addedCategory);
    } catch (err) {
      next(err);
    }
  }
);

//카테고리 삭제
categoryRouter.delete(
  "/category/:catg",
  adminRequired,
  async (req, res, next) => {
    try {
      const { catg } = req.params;
      const books = await bookService.getFindByCategory(catg);

      if (books.length !== 0) {
        throw new Error("카테고리에 책이 존재하고 있습니다.");
      }

      const deletedCategory = await categoryService.deleteCategory(catg);
      res.status(201).json(deletedCategory);
    } catch (err) {
      next(err);
    }
  }
);

// 카테고리 업데이트
categoryRouter.patch(
  "/category/:catg",
  adminRequired,
  async (req, res, next) => {
    try {
      if (is.emptyObject(req.body)) {
        throw new Error(
          "headers의 Content-Type을 application/json으로 설정해주세요"
        );
      }
      const { catg } = req.params;

      const name = req.body.name;

      const toUpdate = {
        ...(name && { name }),
      };

      const updatedCategoryInfo = await categoryService.setCategory(
        catg,
        toUpdate
      );

      res.status(200).json(updatedCategoryInfo);
    } catch (err) {
      next(err);
    }
  }
);

export { categoryRouter };
