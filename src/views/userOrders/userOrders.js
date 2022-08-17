import * as Api from "/api.js";
import { nav } from "../nav/nav.js";

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement("afterbegin", nav);
}

const container = document.querySelector(".tbody");
const cancelButton = document.querySelector(".cancelButton");

const eventCheck = document.querySelector(".container-box-child");

const getOrderList = async () => {
  const userdata = await Api.get("/api/user");
  const userid = userdata._id;
  const orderList = await Api.get(`/api/orders/${userid}`);
  console.log(orderList);
  const result = orderList
    .map(
      (e, i) => `
    <tr id="${e._id}">
    <td>${i + 1}</td>
    <td>${e.createdAt.slice(0, 10)}</td>
    <td>${e.orderedBooks.map((a) => a.bookId.title + " </br>").join("")}</td>
    <td>${e.status}</td>
    <td>
      <button type="button" class="button cancelButton">주문 취소</button>
    </td>
  </tr>`
    )
    .join("");

  container.innerHTML = result;
};
getOrderList();

container.addEventListener("click", (event) => {
  const target = event.target;
  const id = target.parentNode.parentNode.id;
  if (target.tagName === "BUTTON") {
    // orderid를 넣어주어야 함
    cancelOrder(id);
  }
});

const cancelOrder = async (id) => {
  const confirmCancle = confirm("정말 취소하시겟습니까 ㅇㅅㅇ");
  if (confirmCancle) {
    try {
      await Api.delete(`/api/orders/${id}`);
      alert("삭제되었습니다");
      window.location.href = "/orders";
    } catch (err) {
      console.log(err);
    }
  }
};
