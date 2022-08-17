import * as Api from "/api.js";
import { nav } from '../nav/nav.js'

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement('afterbegin', nav)
}

const container = document.querySelector(".tbody");
const users = await Api.get("/api/userlist", "");

gerUserList(users);

// 유저 목록 렌더링
async function gerUserList() {
  users.forEach((user) => {
    const { createdAt, email, fullName, role, _id } = user;
    const updateButtonId = "updateButton-" + _id;
    const deleteButtonId = "deleteButton-" + _id;

    let anotherRole = "";
    if (role === "basic-user") {
      anotherRole = "admin-user";
    } else {
      anotherRole = "basic-user";
    }
    container.innerHTML += `
    <tr>
      <th id=
      'color'>${createdAt}</th>
      <td id="td">${email}</td>
      <td id="td">${fullName}</td>
      <td>
        <select name="role" class="selectButton" id=${updateButtonId}>
          <option value=${role}>${role}</option>
          <option value=${anotherRole}>${anotherRole}</option>
        </select>
      </td>
      <td>
        <button type="button" class="deleteButton" id=${deleteButtonId}>회원삭제</button>
      </td>
  </tr>
    `;
  });
}

// 회원 권한 변경 기능
async function updateUserHandler(userId, role) {
  try {
    const data = { role };
    await Api.patch("/api/users", userId, data);
    window.location.href = "/userList";
  } catch (err) {
    console.log(err);
  }
}

for (let i = 0; i < users.length; i++) {
  const userId = users[i]._id;
  const updateButtonId = "updateButton-" + userId;
  const updateButton = document.getElementById(updateButtonId);

  updateButton.addEventListener("change", function () {
    let role = updateButton.options[updateButton.selectedIndex].text;
    updateUserHandler(userId, role);
  });
}

// 회원 삭제
async function deleteUserHandler(userId) {
  const confirmCancle = confirm("정말 삭제하시겠습니까?");
  console.log(userId);
  if (confirmCancle) {
    try {
      await Api.delete("/api/users", userId, {});
      alert("삭제되었습니다");
      window.location.href = "/userlist";
    } catch (err) {
      console.log(err);
    }
  }
}

for (let i = 0; i < users.length; i++) {
  const userId = users[i]._id;
  const deleteButtonId = "deleteButton-" + userId;
  const deleteButton = document.getElementById(deleteButtonId);
  deleteButton.addEventListener("click", function () {
    deleteUserHandler(userId);
  });
}
