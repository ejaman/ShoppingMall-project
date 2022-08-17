import * as Api from "/api.js";
import { addCommas } from "../useful-functions.js";
import { nav } from "../nav/nav.js";
import { getCartItem, getOrderItem } from "../cart/indexeddb.js";
const urlParams = new URLSearchParams(window.location.search);
const bookID = urlParams.get("id");

// 상세 페이지
let ImgDiv = document.querySelector(".productLeftBox");
let category = document.querySelector(".category");
let title = document.querySelector(".titleTag");
let price = document.querySelector("#price");
let author = document.querySelector("#writerTag");
let publisher = document.querySelector("#publisherTag");
let description = document.querySelector("#descriptionTag");

//댓글
let commentBox = document.querySelector("#commentBox");

// 장바구니
const purchaseBtn = document.querySelector("#purchaseBtn");
const cartBtn = document.querySelector("#cartBtn");

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement("afterbegin", nav);
}

const rendering = async function () {
  const book = await Api.get("/api/books", bookID);
  console.log(book);

  //img 삽입
  const img = document.createElement("img");
  img.src = book.image;
  ImgDiv.appendChild(img);
  //detail 삽입
  category.innerHTML = book.category;
  title.innerHTML = book.title;
  price.innerHTML = addCommas(book.price);
  author.innerHTML = book.author;
  publisher.innerHTML = book.publisher;
  description.innerHTML = book.description;
  console.log(ImgDiv);

  //댓글 삽입 (댓글 작성자 populate 필요)
  const comments = book.comments;
  for (let i = 0; i < comments.length; i++) {
    let commentId = comments[i]._id;
    commentBox.innerHTML += `<div class="commentRow">
    <span class="commentSpan">${comments[i].author.fullName}</span>
    <span class="commentSpan">${comments[i].createdAt}</span>
    <button class="commentDelete" id="${commentId}">삭제</button>
    <div class="commentDiv">${comments[i].content}</div>
</div>`;
  }
};

rendering();

//관리자 계정이면 상품수정, 상품삭제 버튼,
// 비회원이거나 일반회원이면 장바구니, 바로구매 버튼을 보여줌

const isLogin = sessionStorage.getItem("token") ? true : false;
const adminBtns = document.querySelector("#adminBtn");
const userBtns = document.querySelector("#userBtn");

if (isLogin) {
  const user = await Api.get("/api/user");
  const isAdmin = user.role === "admin-user" ? true : false;
  if (isAdmin) {
    adminBtns.style.display = "flex";
    userBtns.style.display = "none";
  }
}

// indexed db
const texterDB = indexedDB.open("texterDB", 1);
texterDB.onsuccess = async () => {
  console.log("indexed db 실행");
};

// 장바구니에 추가
cartBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const data = await getCartItem();
  const cartItemIds = data.map((a) => a.bookId);
  cartItemIds.includes(bookID)
    ? alert("이미 장바구니에 추가된 도서입니다.")
    : await addBooktoCart();
});

const addBooktoCart = async () => {
  // 아이디, 제목, 이미지, 가격, 수량은 1개로 => 현재 시험 데이터
  const result = await Api.get(`/api/books/${bookID}`);
  const book = {
    bookId: result._id,
    title: result.title,
    img: result.image,
    price: result.price,
    quantity: 1,
  };
  const transaction = texterDB.result.transaction("cart", "readwrite");
  const cart = transaction.objectStore("cart");
  cart.add(book);
  alert("장바구니에 추가되었습니다");
};

//바로 구매하기
purchaseBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  buyNow();
});
const buyNow = async () => {
  const book = await Api.get("/api/books", bookID);
  const data = await getOrderItem();
  const buynow = {
    id: data[1].id,
    name: data[1].name,
    totalPrice: book.price,
    totalQuantity: 1,
    orderedBooks: [
      {
        bookId: {
          _id: book._id,
          title: book.title,
        },
        quantity: 1,
      },
    ],
  };
  const transaction = texterDB.result.transaction("order", "readwrite");
  const order = transaction.objectStore("order");
  order.put(buynow);
  window.location.href = "/order";
};

//상품 수정하기
const updateBtn = document.querySelector("#updateBtn");
updateBtn.addEventListener("click", (e) => {
  e.preventDefault();

  window.location.href = `/bookUpdate/?id=${bookID}`;
});

//상품 삭제하기
const deleteBtn = document.querySelector("#deleteBtn");
const deleteBook = async function () {
  // const urlParams = new URLSearchParams(window.location.search);
  // const bookID = urlParams.get("id");
  await Api.delete(`/api/book/${bookID}`);
  window.location.href = "/";
};
deleteBtn.addEventListener("click", (e) => {
  e.preventDefault();
  deleteBook();
});

// 댓글 작성하기
const commentInput = document.querySelector("#commentInput");
const submitButton = document.querySelector("#submitButton");

submitButton.addEventListener("click", addComment);

async function addComment() {
  try {
    const content = commentInput.value;
    const user = await Api.get("/api/user");
    const data = {
      bookId: bookID,
      userId: user._id,
      content,
    };
    await Api.post("/api/books/comment", data);
    location.reload();
  } catch (err) {
    console.error(err.stack);
    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }
}

// 댓글 삭제하기
async function deleteComment(commentId) {
  try {
    const data = {
      bookId: bookID,
    };
    await Api.delete("/api/books/comments", commentId, data);
    location.reload();
  } catch (err) {
    console.error(err.stack);
    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }
}

const book = await Api.get("/api/books", bookID);
const comments = book.comments;
for (let i = 0; i < comments.length; i++) {
  const commentId = comments[i]._id;
  const deleteButton = document.getElementById(commentId);

  deleteButton.addEventListener("click", function () {
    deleteComment(commentId);
  });
}
