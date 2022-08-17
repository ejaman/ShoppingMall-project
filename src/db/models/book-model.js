import { model } from "mongoose";
import { BookSchema } from "../schemas/book-schema";

const Book = model("books", BookSchema);

export class BookModel {
  // 이름으로 책 조회
  async findByName(title) {
    const book = await Book.findOne({ title });
    return book;
  }

  async findById(bookId) {
    const book = await Book.findOne({ _id: bookId }).populate({
      path: "comments",
      populate: { path: "author" },
    });
    return book;
  }

  // 모든 책 조회
  async findAll() {
    const books = await Book.find({});
    return books;
  }

  // 새로운 책 등록
  async create(bookInfo) {
    const createdNewBook = await Book.create(bookInfo);
    return createdNewBook;
  }

  // 책 수정
  async update({ bookId, update }) {
    const filter = { _id: bookId };
    const option = { returnOriginal: false };
    const updatedBook = await Book.findOneAndUpdate(filter, update, option);
    return updatedBook;
  }

  // 책 삭제
  async delete(bookId) {
    const deletedBook = await Book.findByIdAndDelete({ _id: bookId });
    return deletedBook;
  }
  // 카테고리로 조회
  async findByCategory(category) {
    const books = await Book.find({ category });
    return books;
  }

  // 댓글 추가 업데이트
  async updateComment(commentInfo) {
    const { bookId, author, content } = commentInfo;
    const filter = { _id: bookId };
    const option = { returnOriginal: false };
    const update = { $push: { comments: { content, author } } };

    const updatedComment = await Book.findOneAndUpdate(filter, update, option);
    return updatedComment;
  }

  // bookId 에 대한 댓글 조회
  async getCommentsFindByBookId(bookId) {
    const book = await Book.findOne({ _id: bookId });
    return book;
  }

  // 댓글 삭제
  async deleteComment(commentInfo) {
    const { bookId, commentId } = commentInfo;
    const filter = { _id: bookId };
    const option = { returnOriginal: false };
    const update = { $pull: { comments: { _id: commentId } } };

    const deletedComment = await Book.findOneAndUpdate(filter, update, option);

    return deletedComment;
  }
}

const bookModel = new BookModel();

export { bookModel };
