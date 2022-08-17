import { bookModel } from "../db";

class BookService {
  constructor(bookModel) {
    this.bookModel = bookModel;
  }

  // 책 추가
  async addBook(bookInfo) {
    const { title, category, author, description, image, price, publisher } = bookInfo;

    // 중복 확인
    const book = await this.bookModel.findByName(title);
    if (book) {
      throw new Error("이미 존재하는 책입니다....");
    }

    const createdNewBook = await this.bookModel.create(bookInfo); //DB저장

    return createdNewBook;
  }

  // 전체 책 조회
  async getBooks() {
    const books = await this.bookModel.findAll();
    return books;
  }

  // bookId로 책 찾기
  async getFindById(bookId) {
    const book = await this.bookModel.findById(bookId);
    return book;
  }

  // 카테고리로 책 찾기
  async getFindByCategory(category) {
    const books = await this.bookModel.findByCategory(category);
    return books;
  }

  //책 수정
  async setBook(bookId, toUpdate) {
    // 우선 해당 이름의 책이 DB에 존재하는지 확인
    let book = await this.bookModel.findById(bookId);

    // db에서 찾지 못한 경우, 에러 메시지 반환
    if (!book) {
      throw new Error(
        "해당 책은 존재하지 않습니다. 다시 한번 확인해주시기 바랍니다...."
      );
    }

    // 업데이트 진행
    book = await this.bookModel.update({
      bookId,
      update: toUpdate,
    });

    return book;
  }

  // 삭제
  async deleteBook(bookId) {
    const book = await this.bookModel.delete(bookId);
    return book;
  }

  // 책에 대한 댓글(리뷰) 기능 //
  // 댓글 추가
  async addComment(commentInfo) {
    const comment = await this.bookModel.updateComment(commentInfo);
    return comment;
  }

  // 댓글 조회
  async getComments(bookId) {
    const comments = await this.bookModel.getCommentsFindByBookId(bookId);
    return comments;
  }

  // 댓글 삭제
  async deleteComment(commentInfo) {
    const comment = await this.bookModel.deleteComment(commentInfo);
    return comment;
  }
}

const bookService = new BookService(bookModel);

export { bookService };
