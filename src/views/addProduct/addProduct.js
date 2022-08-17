import * as Api from "/api.js";
import { nav } from "../nav/nav.js";

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement("afterbegin", nav);
}

const submitBtn = document.querySelector("#submitBtn");
const select = document.querySelector("#category");

const nameInput = document.querySelector("#nameInput");
const categorySelect = document.querySelector("#category");
const priceInput = document.querySelector("#priceInput");
const authorInput = document.querySelector("#authorInput");
const descriptionInput = document.querySelector("#descriptionInput");
const imgUrl = document.querySelector("#imgUrlInput");
const publisherInput = document.querySelector("#publisherInput");

// 카테고리 불러오기
const getCategoryList = async () => {
  const data = await Api.get("/api/category/categorylist");
  const result = await data
    .map((a) => `<option class="category">${a.name}</option>`)
    .join("");
  select.innerHTML = result;
};
getCategoryList();

submitBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  const title = nameInput.value;
  const author = authorInput.value;
  const image = imgUrl.value;
  const price = priceInput.value;
  const publisher = publisherInput.value;
  const description = descriptionInput.value;
  const category = categorySelect.value;

  if (!title) {
    return alert("책 이름을 입력해주세요.");
  }
  if (!price) {
    return alert("책 가격을 입력해주세요.");
  }
  if (priceInput.value < 1) {
    return alert("책 가격을 다시 확인해주세요");
  }
  if (!author) {
    return alert("저자를 입력해주세요.");
  }
  if (!publisher) {
    return alert("출판사를 입력해주세요.");
  }
  if (!description) {
    return alert("상품 설명을 입력해주세요.");
  }
  if (!image) {
    return alert("이미지URL을 입력해주세요.");
  }

  try {
    await Api.post("/api/book/add", {
      title,
      author,
      price,
      image,
      description,
      category,
      publisher,
    });

    alert("상품이 추가되었습니다.");
    // 일단 홈으로 이동
    const detail = await Api.get("/api/book/booklist");
    const currBook = detail[detail.length - 1];
    window.location.href = `/book/?id=${currBook._id}`;
  } catch (err) {
    alert("책 정보를 모두 입력해주세요");
    console.error(err);
    window.location.href = "/addBook";
  }
});

async function test() {
  const result = await Api.get("/api/book/booklist");
  console.log(result);
}
test();
