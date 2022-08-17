import { Router } from "express";
import { bookService } from "../services";
import { categoryService, categories } from "../services";
import { adminRequired } from "../middlewares";
//import { convert } from "xml-js";

import is from "@sindresorhus/is";
const axios = require("axios");
const convert = require("xml-js");
const request = require("request");

const bookRouter = Router();

// 전체 책 리스트
bookRouter.get("/book/booklist", async (req, res, next) => {
  try {
    const books = await bookService.getBooks();
    res.status(200).json(books);
  } catch (err) {
    next(err);
  }
});

bookRouter.get("/books/:id", async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const book = await bookService.getFindById(bookId); // 전체 책 리스트
    res.status(200).json(book); // json 형태로 보내줌
  } catch (err) {
    next(err);
  }
});

bookRouter.get("/books/category/:category", async (req, res, next) => {
  try {
    const bookCategory = req.params.category;
    const book = await bookService.getFindByCategory(bookCategory); // 전체 책 리스트
    res.status(200).json(book); // json 형태로 보내줌
  } catch (err) {
    next(err);
  }
});

// 책 추가
bookRouter.post("/book/add", adminRequired, async (req, res, next) => {
  try {
    const { title, category, author, description, image, price, publisher } = req.body;
    const bookInfo = { title, category, author, description, image, price, publisher };
    const addedBook = await bookService.addBook(bookInfo);

    res.status(201).json(addedBook); // json 형태로 보내줌
  } catch (err) {
    next(err);
  }
});

bookRouter.delete("/book/:bookId", adminRequired, async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    const deletedBook = await bookService.deleteBook(bookId);

    res.status(201).json(deletedBook); // json 형태로 보내줌
  } catch (err) {
    next(err);
  }
});

bookRouter.patch("/book/:bookId", adminRequired, async (req, res, next) => {
  try {
    if (is.emptyObject(req.body)) {
      throw new Error(
        "headers의 Content-Type을 application/json으로 설정해주세요"
      );
    }
    const bookId = req.params.bookId;

    const title = req.body.title;
    const category = req.body.category;
    const price = req.body.price;
    const author = req.body.author;
    const publisher = req.body.publisher;
    const description = req.body.description;
    const image = req.body.image;

    const toUpdate = {
      ...(title && { title }),
      ...(category && { category }),
      ...(price && { price }),
      ...(author && { author }),
      ...(publisher && { publisher }),
      ...(description && { description }),
      ...(image && { image }),
    };

    const updatedBookInfo = await bookService.setBook(
      req.params.bookId,
      toUpdate
    );

    res.status(200).json(updatedBookInfo);
  } catch (err) {
    next(err);
  }
});

// 카테고리+책으로 네이버 API 검색을 통해 DB에 추가
bookRouter.get(
  "/search/book/:catg/:name",
  adminRequired,
  async function (req, res, next) {
    const client_id = "U_caRiNOoMAVi_8tVk77";
    const client_secret = "mZDaYicyb6";
    const { catg, name } = req.params;
    // 카테고리 키 값 추출
    const catgNumber = Object.keys(categories).filter(
      (key) => categories[key] === catg
    )[0];

    try {
      const xml = await axios({
        url:
          `https://openapi.naver.com/v1/search/book_adv.xml?display=5?d_catg=${catgNumber}&d_titl=` +
          encodeURIComponent(name), // 통신할 웹문서
        method: "get",
        headers: {
          "X-Naver-Client-Id": client_id,
          "X-Naver-Client-Secret": client_secret,
        },
      });
      const xmlToJson = convert.xml2json(xml.data, {
        compact: true,
        spaces: 2,
      });
      const json = JSON.parse(xmlToJson).rss.channel.item;
      const result = [];
      for (let i = 0; i < json.length; i++) {
        let newObj = {};
        for (const js in json[i]) {
          const text = json[i][js]["_text"];
          const parsedText = text
            .replace(/<[^>]*>/gi, "")
            .replace(/(\r\n|\n|\r)/gm, "");
          newObj[js] = parsedText;
        }
        result.push(newObj);
      }

      for (let i = 0; i < result.length; i++) {
        await bookService.addBook({
          title: result[i].title,
          link: result[i].link,
          author: result[i].author,
          price: result[i].price,
          publisher: result[i].publisher,
          pubdate: result[i].pubdate,
          image: result[i].image,
          description: result[i].description,
          isbn: result[i].isbn,
          category: catg,
        });
      }
      const category = await categoryService.findName(catg);
      if (!category) {
        await categoryService.addCategory(catg);
      }

      return res.status(200).json(result);
    } catch (err) {
      console.log(err);
    }
  }
);

//네이버 책 API로 DB에 저장
// const options = {
//   headers: {
//     "X-Naver-Client-Id": "U_caRiNOoMAVi_8tVk77",
//     "X-Naver-Client-Secret": "mZDaYicyb6",
//   },
//   method: "get",
//   encoding: "utf-8",
//   url: "https://openapi.naver.com/v1/search/book_adv.xml",
//   qs: {
//     d_titl: "소년 탐정 김전일 5",
//     display: 1,
//     start: 1,
//     d_categ: 330,
//   },
// };

// request(options, async (err, res, body) => {
//   let result = convert.xml2json(body, { compact: true, spaces: 4 });
//   let realresult = JSON.parse(result).rss.channel.item;
//   let sub = /(<([^>]+)>)|&quot;/gi;
//   let item = {};
//   item.title = realresult.title._text.replace(sub, ""); //나머지 아이템들 생략
//   item.link = realresult.link._text.replace(sub, "");
//   item.author = realresult.author._text.replace(sub, "");
//   item.price = realresult.price._text.replace(sub, "");
//   item.publisher = realresult.publisher._text.replace(sub, "");
//   item.image = realresult.image._text.replace(sub, "");
//   item.description = realresult.description._text
//     .replace(sub, "")
//     .replace(/(\r\n|\n|\r)/gm, "");
//   item.isbn = realresult.isbn._text.replace(sub, "");
//   item.category = categories[options.qs.d_categ];
//   await bookService.addBook(item);
// });

export { bookRouter };
