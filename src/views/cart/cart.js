import {
  getCartItem,
  getOrderItem,
  getCartItemByID,
  clearCart,
} from "./indexeddb.js";
import { nav } from "../nav/nav.js";

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement("afterbegin", nav);
}

const checkAllBtn = document.querySelector(".checkAllBtn");
const deleteCheckedBtn = document.querySelector(".cart-header a:nth-child(2)");
const deleteAllBtn = document.querySelector(".cart-header a:nth-child(3)");
const cartItems = document.querySelector(".cart-lists");
const orderInfo = document.querySelector(".orderInfo");
const submit = document.querySelector("#submitBtn");

// 인덱스드 디비 부분
const texterDB = indexedDB.open("texterDB", 1);
texterDB.onsuccess = async () => {
  console.log("indexeddb를 실행합니다.");
  await readItemList();
};

const readItemList = async () => {
  const data = await getCartItem();
  const rows = await data
    .map(
      (r) => `<div class="row" id="${r.id}" > 
      <input
        class="row-element check"
        type="checkbox"
        value="${r.id}"
        name="buy"
        checked
      />
      <div class="img row-element">
        <img class="image" src="${r.img}" />
      </div>
      <div class="book-info row-element">
        <span class="title is-6">${r.title}</span>
        <span class="subtitle is-6">${r.price}</span>
      </div>
      <div class="num row-element">
        <!-- "장바구니 수량 변경" -->
        <div class="updown">
          <button class="quantity minus" value="-">
            <i class="fa-solid fa-circle-minus"></i>
          </button>
          <input type="text" class="input" value="${r.quantity}" disabled />
          <button class="quantity plus" value="+">
            <i class="fa-solid fa-circle-plus"></i>
          </button>
        </div>
      </div>
      <!-- "장바구니 상품 합계" -->
      <div class="sum row-element">${r.quantity * r.price}원</div>
      <a class="delete"></a>
    </div>`
    )
    .join("");
  if (cartItems) {
    cartItems.innerHTML = rows;
  }
  await btns();
};

const btns = async () => {
  const checks = document.getElementsByClassName("check");
  const checkArr = Array.from(checks);
  changeOrderTable(checkArr);

  if (checkAllBtn) {
    checkAllBtn.addEventListener("click", (e) => {
      const target = e.target;
      const checked = target.checked;
      checked
        ? checkArr.forEach((a) => (a.checked = true))
        : checkArr.forEach((a) => (a.checked = false));
      changeOrderTable(checkArr);
    });
  }

  checkArr.forEach((c) =>
    c.addEventListener("click", (e) => {
      changeOrderTable(checkArr);
      controlCheckbox(checkArr);
    })
  );

  const deletes = document.getElementsByClassName("delete");
  const deleteArr = Array.from(deletes);
  deleteArr.forEach((d) =>
    d.addEventListener("click", (event) => {
      event.preventDefault();
      deleteCartItem(event);
      changeOrderTable(checkArr);
    })
  );

  const ups = document.getElementsByClassName("plus");
  const up = Array.from(ups);
  up.forEach((u) =>
    u.addEventListener("click", (event) => {
      event.preventDefault();
      upBtnHandler(event);
      changeOrderTable(checkArr);
    })
  );
  const downs = document.getElementsByClassName("minus");
  const down = Array.from(downs);
  down.forEach((d) =>
    d.addEventListener("click", (event) => {
      event.preventDefault();
      downBtnHandler(event);
      changeOrderTable(checkArr);
    })
  );

  const inputs = document.getElementsByClassName("input");
  const input = Array.from(inputs);
  input.map((a, i) => {
    if (a.value * 1 >= 10) {
      up[i].disabled = true;
    } else if (a.value * 1 <= 1) {
      down[i].disabled = true;
    }
  });
};
const controlCheckbox = (arr) => {
  const length = arr.filter((a) => a.checked).length;
  if (length === arr.length) {
    checkAllBtn.checked = true;
  } else {
    checkAllBtn.checked = false;
  }
};

const changeOrderTable = async (arr) => {
  const checkedItem = arr.filter((a) => a.checked).map((a) => a.parentNode.id);
  console.log("checkedItem", checkedItem);
  const data = await getOrderItem();
  const orderedBooks = [];
  let price = 0;
  let totalQuantity = 0;
  for (let i of checkedItem) {
    const cartItem = await getCartItemByID(i * 1);
    price += cartItem.price * cartItem.quantity;
    totalQuantity += cartItem.quantity;
    const data = {
      bookId: {
        _id: cartItem.bookId,
        title: cartItem.title,
        p: cartItem.price * cartItem.quantity,
      },
      quantity: cartItem.quantity,
    };
    orderedBooks.push(data);
  }
  // order 테이블에 put할 데이터를 불러옴
  const orderdata = {
    id: data[0].id,
    name: data[0].name,
    totalPrice: price,
    totalQuantity: totalQuantity,
    orderedBooks: orderedBooks,
  };
  const order = texterDB.result
    .transaction("order", "readwrite")
    .objectStore("order");
  order.put(orderdata);

  const result = `<div class="info">
  <span>총 주문 상품 수 </span>
  <span>${totalQuantity}</span>
</div>
<div class="info">
  <span>상품금액</span>
  <span>${price}</span>
</div>
<div class="info"><span>배송비 </span><span>3,000원</span></div>
<div class="info total">
  <span>총 상품 가격</span>
  <span id="total-price">${totalQuantity === 0 ? 0 : price + 3000}</span>
</div>`;
  orderInfo.innerHTML = result;
};

// 장바구니 선택 삭제
if (deleteCheckedBtn) {
  deleteCheckedBtn.addEventListener("click", () => {
    deleteCheckedItem();
    readItemList();
  });
}

// 장바구니 비우기
if (deleteAllBtn) {
  deleteAllBtn.addEventListener("click", () => {
    if (confirm("장바구니를 비우시겠습니까?")) {
      clearCart();
    }
    readItemList();
  });
}

// 선택 상품 삭제 버튼 클릭 ✅
const deleteCheckedItem = () => {
  const conf = confirm("선택 상품을 삭제하시겠습니까?");
  if (conf) {
    const inputs = document.querySelectorAll("input[name=buy]:checked");
    const arrInput = Array.from(inputs);
    const database = texterDB.result;
    const transaction = database.transaction("cart", "readwrite");
    const cart = transaction.objectStore("cart");
    arrInput.map((a) => cart.delete(Number(a.value)));
  }
};

// row의 삭제 버튼 클릭 ✅
const deleteCartItem = async (event) => {
  const id = event.target.parentNode.id * 1;
  const database = texterDB.result;
  const transaction = database.transaction("cart", "readwrite");
  const cart = transaction.objectStore("cart");
  cart.delete(id);
  alert("삭제되었습니다.");
  readItemList();
};

// 수량 증가
const upBtnHandler = async (event) => {
  const id = event.currentTarget.parentNode.parentNode.parentNode.id * 1;
  const data = await getCartItemByID(id);
  const transaction = texterDB.result.transaction("cart", "readwrite");
  const cart = transaction.objectStore("cart");

  const amount = {
    id: data.id,
    bookId: data.bookId,
    title: data.title,
    img: data.img,
    price: data.price,
    quantity: ++data.quantity,
  };
  cart.put(amount);
  readItemList();
};

// 수량 감소
const downBtnHandler = async (event) => {
  const id = event.currentTarget.parentNode.parentNode.parentNode.id * 1;
  const data = await getCartItemByID(id);
  const transaction = texterDB.result.transaction("cart", "readwrite");
  const cart = transaction.objectStore("cart");

  const amount = {
    id: data.id,
    bookId: data.bookId,
    title: data.title,
    img: data.img,
    price: data.price,
    quantity: --data.quantity,
  };
  cart.put(amount);
  readItemList();
};

submit.addEventListener("click", async () => {
  const data = await getCartItem();
  if (data.length < 1) {
    if (!alert("주문할 상품이 장바구니에 존재하지 않습니다."));
    document.location = window.location.href = "/";
  } else {
    window.location.href = "/order";
  }
});

export { getCartItem, getCartItemByID, getOrderItem, clearCart };
