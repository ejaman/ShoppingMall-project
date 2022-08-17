import { Router } from "express";
import { loginRequired } from "../middlewares";
import { bookService } from "../services";

const commentRouter = Router();

// 해당 bookId에 대한 댓글 조회
commentRouter.get("/books/comments", async function (req, res) {
  const bookId = req.body.bookId;
  const comment = await bookService.getComments(bookId);

  res.status(200).json(comment);
});

// 해당 bookId에 대한 댓글 생성
commentRouter.post("/books/comment", loginRequired, async function (req, res) {
  const bookId = req.body.bookId;
  const author = req.body.userId;
  const content = req.body.content;
  const commentInfo = { bookId, author, content };

  const comment = await bookService.addComment(commentInfo);
  res.status(200).json(comment);
});

// 해당 bookId에 대한 댓글 삭제
commentRouter.delete(
  "/books/comments/:commentId",
  loginRequired,
  async function (req, res) {
    const bookId = req.body.bookId;
    const commentId = req.params.commentId;
    const commentInfo = { bookId, commentId };

    const comment = await bookService.deleteComment(commentInfo);
    res.status(200).json(comment);
  }
);

export { commentRouter };
