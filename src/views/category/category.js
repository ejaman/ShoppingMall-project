import * as Api from "/api.js";
import { nav } from "../nav/nav.js";

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement("afterbegin", nav);
}

const addCategoryButton = document.querySelector("#addCategoryButton");
const titleInput = document.querySelector("#titleInput");
const categoryList = document.querySelector(".category-list");

const edits = async () => {
  const edit = document.getElementsByClassName("edit-btn");
  const del = document.getElementsByClassName("delete-btn");

  Array.from(edit).map((btn) =>
    btn.addEventListener("click", (e) => {
      const target = e.target;
      const input = target.parentNode.childNodes[1].innerHTML;
      // const input = target.previousSibling;
      updateCategoryName(input);
    })
  );
  Array.from(del).map((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      deleteCategory(e);
    })
  );
};

const deleteCategory = async (e) => {
  const target = e.target;
  const inputValue =
    target.parentNode.previousElementSibling.childNodes[1].innerHTML;
  console.log(inputValue);
  const deleteConfirm = confirm("카테고리를 삭제하시겠습니까?");
  if (deleteConfirm) {
    try {
      await Api.delete(`/api/category/${inputValue}`);
      window.location.href = "/category";
    } catch (err) {
      // console.log(err);
      alert(err);
    }
  }
};

const updateCategoryName = async (input) => {
  const newCategory = prompt("변경할 값을 입력해주세요");
  if (newCategory === "") {
    alert("아무값도 입력되지 않았습니다.");
  } else {
    const data = { name: newCategory };

    try {
      await Api.patch("/api/category", input, data);
      window.location.href = "/category";
    } catch (err) {
      console.log(err);
    }
  }
};

// 1. 카테고리 리스트 띄우기
const getCategoryList = async () => {
  const data = await Api.get("/api/category/categorylist");
  const result = await data
    .map(
      (el, idx) => `
      <tr>
      <th id="color">${idx + 1}</th>
      <th class="th-style">
      <span class="input-name">${el.name}</span>
      <button class="edit-btn">edit</button></th>
      <th><button class="delete-btn">❌</button></th>
    </tr>`
    )
    .join("");
  categoryList.innerHTML = result;
  await edits();
};

getCategoryList();

// 2. 카테고리 추가할 수 있게 만들기
addCategoryButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const name = titleInput.value;
  addCategory(name);
});

const addCategory = async (name) => {
  try {
    await Api.post(`/api/category/${name}`);
    alert("카테고리가 추가되었습니다.");
    window.location.href = "/category";
  } catch (err) {
    console.log(err);
    alert("값을 입력해주세요");
    window.location.href = "/category";
  }
};
