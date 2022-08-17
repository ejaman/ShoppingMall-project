import * as Api from "/api.js";
import { nav } from "/nav/nav.js";

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement("afterbegin", nav);
}
// 요소(element), input 혹은 상수
const currentPasswordInput = document.querySelector("#currentPasswordInput");
const passwordCheckButton = document.querySelector("#passwordCheckButton");

passwordCheckButton.addEventListener("click", sendPassword);

// 현재 비밀번호 확인
async function sendPassword(e) {
  e.preventDefault();
  try {
    const currentPassword = currentPasswordInput.value;
    const data = { currentPassword };
    await Api.post("/api/checkPassword", data);

    window.location.href = "/accountUpdate";
  } catch (err) {
    console.error(err.stack);
    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }
}
