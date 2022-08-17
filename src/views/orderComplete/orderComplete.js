// 장바구니 초기화
import { nav } from "../nav/nav.js";

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement("afterbegin", nav);
}

const texterDB = indexedDB.open("texterDB", 1);
texterDB.onsuccess = async () => {
  console.log("indexeddb 실행");
  // clearOrder();
};
// const clearOrder = () => {
//   const database = texterDB.result;
//   const transaction = database.transaction("order", "readwrite");
//   const order = transaction.objectStore("order");
//   order.clear();
// };
