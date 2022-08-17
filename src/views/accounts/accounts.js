import * as Api from "/api.js";
import { nav } from "../nav/nav.js";

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement("afterbegin", nav);
}

const checkFromAccountsUsers = document.querySelector("#myInfo");

if ( checkFromAccountsUsers !== null ){
  const isLogin = sessionStorage.getItem("token") ? true : false;

  if (isLogin) {
    async function checkAdmin() {
      const userRole = await Api.get("/api/user");
      const isAdmin = userRole.role === "admin-user" ? true : false;
      const myOrders = document.querySelector('#myOrders')
      if(!isAdmin){
        myOrders.style.display = "flex";
      }
    }
    checkAdmin();
  } else {
    alert('로그인이 필요합니다.');
    window.location.href = "/login";
  }
}