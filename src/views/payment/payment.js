import * as Api from "/api.js";
import { getOrderItem, getCartItem, clearCart } from "../cart/indexeddb.js";
import { nav } from "../nav/nav.js";

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement("afterbegin", nav);
}

const submitBtn = document.querySelector("#submitBtn");
const searchAddressBtn = document.getElementById("searchAddressButton");
const getUserInfo = document.querySelector(".userInfo");

const tbcontainer = document.querySelector(".table-body");
const container = document.querySelector(".pay-Info");
const nameInput = document.querySelector("#userName");
const phoneInput = document.querySelector("#phoneNumber");
const addressInput = document.querySelector("#address");
const postalInput = document.querySelector("#postalCode");
const detaileInput = document.querySelector("#detailed-address");
const msgInput = document.querySelector("#requestSelectBox");

const ref = document.referrer;
const prevPage = ref.includes("book");
const id = ref.slice(ref.indexOf("=") + 1, ref.length);
// const id = ref.slice(31, ref.length);
const checkUser = async () => {
  try {
    const userdata = await Api.get("/api/user");
  } catch (err) {
    console.log(err);
    alert("로그인해주세요");
    window.location.href = "/login";
  }
};
checkUser();

const texterDB = indexedDB.open("texterDB", 1);
texterDB.onsuccess = async () => {
  prevPage ? await buynowOrder(id) : await readOrder();
};
// 장바구니 주문할 때
const readOrder = async () => {
  const data = await getOrderItem();
  const cart = await getCartItem();
  const tableResult = data[0].orderedBooks
    .map(
      (a, i) =>
        `<tr class="info-row">
    <td>${a.bookId.title}</td>
    <td>${a.quantity}</td>
    <td>${a.bookId.p}</td>
  </tr>`
    )
    .join("");
  const payResult = `
  <span>상품 총액: ${data[0].totalPrice} 원</span>
  <span>배송비: 3000 원</span>
  <span>총 금액: ${data[0].totalPrice + 3000}</span>`;
  tbcontainer.innerHTML = tableResult;
  container.innerHTML = payResult;
};

// 바로 주문하기
const buynowOrder = async (id) => {
  const data = await getOrderItem();
  const tableResult = data[1].orderedBooks
    .map(
      (a, i) =>
        `<tr class="info-row">
    <td>${a.bookId.title}</td>
    <td>${a.quantity}</td>
    <td>${data[1].totalPrice}</td>
  </tr>`
    )
    .join("");
  const payResult = `
  <span>상품 총액: ${data[1].totalPrice} 원</span>
  <span>배송비: 3000 원</span>
  <span>총 금액: ${data[1].totalPrice + 3000}</span>`;
  tbcontainer.innerHTML = tableResult;
  container.innerHTML = payResult;
};

submitBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const data = await getOrderItem();
  const userId = await Api.get("/api/user");

  const orderdata = {
    userId: userId._id,
    fullName: nameInput.value,
    address: {
      postalCode: postalInput.value,
      address1: addressInput.value,
      address2: detaileInput.value,
    },
    phoneNumber: phoneInput.value,
    deliveryMessage: msgInput.value,
    totalPrice: prevPage === "book" ? data[1].totalPrice : data[0].totalPrice,
    totalQuantity:
      prevPage === "book" ? data[1].totalQuantity : data[0].totalQuantity,
    orderedBooks:
      prevPage === "book" ? data[1].orderedBooks : data[0].orderedBooks,
  };

  try {
    await Api.post("/api/addorder", orderdata);
    alert("주문완료");
    clearCart();
    window.location.href = "/complete";
  } catch (err) {
    alert("배송정보를 모두 입력해주세요");
    console.log(err);
    window.location.href = "/order";
  }
});

getUserInfo.addEventListener("click", async () => {
  const userInfo = await Api.get("/api/user");
  nameInput.value = !getUserInfo.checked ? "" : userInfo.fullName;
  phoneInput.value = !getUserInfo.checked ? "" : userInfo.phoneNumber;
  addressInput.value = !getUserInfo.checked ? "" : userInfo.address.address1;
  postalInput.value = !getUserInfo.checked ? "" : userInfo.address.postalCode;
  detaileInput.value = !getUserInfo.checked ? "" : userInfo.address.address2;
});

// 주소 찾기
const searchAddress = (e) => {
  e.preventDefault();
  new daum.Postcode({
    oncomplete: function (data) {
      let addr = "";
      let extraAddr = "";

      if (data.userSelectedType === "R") {
        addr = data.roadAddress;
      } else {
        addr = data.jibunAddress;
      }

      if (data.userSelectedType === "R") {
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }
        if (extraAddr !== "") {
          extraAddr = " (" + extraAddr + ")";
        }
      } else {
      }
      postalInput.value = data.zonecode;
      addressInput.value = `${addr} ${extraAddr}`;
      detaileInput.placeholder = "상세 주소를 입력해 주세요.";
      detaileInput.focus();
    },
  }).open();
};

searchAddressBtn.addEventListener("click", searchAddress);
