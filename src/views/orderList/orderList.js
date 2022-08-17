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
const orders = await Api.get("/api/orderlist", "");

gerOrderList(orders);

// 주문 목록 렌더링
async function gerOrderList(orders) {
  orders.forEach((order) => {
    const { createdAt, totalPrice, orderedBooks, status, _id } = order;
    const updateButtonId = "updateButton-" + _id;
    const deleteButtonId = "deleteButton-" + _id;

    let orderBookText = "";
    for (let i = 0; i < orderedBooks.length; i++) {
      const { title } = orderedBooks[i].bookId || { title: "" };
      let orderBookinfo = "";
      orderBookinfo += title;
      orderBookinfo += " / ";
      orderBookinfo += orderedBooks[i].quantity;
      orderBookinfo += "\n";
      orderBookText += orderBookinfo.replace(/\n/g, "<br/>");
    }

    let status1 = "";
    let status2 = "";
    if (status === "상품준비중") {
      status1 = "배송중";
      status2 = "배송완료";
    } else if (status === "배송중") {
      status1 = "상품준비중";
      status2 = "배송완료";
    } else if (status === "배송완료") {
      status1 = "상품준비중";
      status2 = "배송중";
    }

    container.innerHTML += `
    <tr>
      <th id=
      'color'>${createdAt}</th>
      <td id="td">${orderBookText}</td>
      <td id="td">${totalPrice}</td>
      <td>
        <select name="status" class="selectButton" id=${updateButtonId}>
          <option id="option1" value=${status}>${status}</option>
          <option id="option2" value=${status1}>${status1}</option>
          <option id="option3" value=${status2}>${status2}</option>
        </select>
      </td>
      <td>
        <button type="button" class="deleteButton" id=${deleteButtonId}>주문취소</button>
      </td>
  </tr>
    `;
  });
}

// 주문 상태 변경 기능
async function updateOrderHandler(orderId, status) {
  try {
    const data = { status };
    await Api.patch("/api/orders", orderId, data);
    // alert("주문 상태가 변경되었습니다.");
    window.location.href = "/orderList";
  } catch (err) {
    console.log(err);
  }
}

for (let i = 0; i < orders.length; i++) {
  const orderId = orders[i]._id;
  const updateButtonId = "updateButton-" + orderId;
  const updateButton = document.getElementById(updateButtonId);

  updateButton.addEventListener("change", function () {
    let status = updateButton.options[updateButton.selectedIndex].text;
    updateOrderHandler(orderId, status);
  });
}

// 관리자 주문 삭제 기능
async function deleteOrderHandler(orderId) {
  const confirmCancle = confirm("정말 삭제하시겠습니까?");
  console.log(orderId);
  if (confirmCancle) {
    try {
      await Api.delete("/api/orders", orderId, {});
      alert("삭제되었습니다");
      window.location.href = "/orderList";
    } catch (err) {
      console.log(err);
    }
  }
}

for (let i = 0; i < orders.length; i++) {
  const orderId = orders[i]._id;
  const deleteButtonId = "deleteButton-" + orderId;
  const deleteButton = document.getElementById(deleteButtonId);
  deleteButton.addEventListener("click", function () {
    deleteOrderHandler(orderId);
  });
}
