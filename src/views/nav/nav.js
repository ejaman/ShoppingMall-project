import * as Api from "../api.js";
import { getCartisEmpty } from "../cart/indexeddb.js";

const nonMemberNav = `
<nav class="navbar" role="navigation" aria-label="main navigation">
<div class="container mt-3">
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img src="/logo.png" width="150" height="85"/>
    </a>
  </div>

    <div class="navbar-end breadcrumb my-auto" aria-label="breadcrumbs">
      <ul id="navbar">
        <li><a href="/login">로그인</a></li>
        <li><a href="/register">회원가입</a></li>
        <li>
            <a aria-current="page" class="cart">
              <span class="icon">
                <i class="fas fa-cart-shopping"></i>
              </span>
              <span>카트</span>
            </a>
        </li>
      </ul>
    </div>
  </div>
</div>
</nav>`;

const memberNav = `
<nav class="navbar" role="navigation" aria-label="main navigation">
<div class="container mt-3">
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img src="/logo.png" width="150" height="85"/>
    </a>
  </div>

    <div class="navbar-end breadcrumb my-auto" aria-label="breadcrumbs" >
      <ul id="navbar">
        <li><a href="/accounts-user">계정관리</a></li>
        <li><a class="logoutBtn", href="#">로그아웃</a></li>
        <li>
            <a aria-current="page" class="cart">
              <span class="icon">
                <i class="fas fa-cart-shopping"></i>
              </span>
              <span>카트</span>
            </a>
        </li>
      </ul>
    </div>
  </div>
</div>
</nav>`;

const adminNav = `
<nav class="navbar" role="navigation" aria-label="main navigation">
<div class="container mt-3">
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img src="/logo.png" width="150" height="85"/>
    </a>
  </div>

    <div class="navbar-end breadcrumb my-auto" aria-label="breadcrumbs">
      <ul id="navbar">
        <li><a href="/accounts-admin">페이지관리</a></li>
        <li><a href="/accounts-user">계정관리</a></li>
        <li><a class="logoutBtn", href="#">로그아웃</a></li>
        <li>
            <a aria-current="page" class="cart">
              <span class="icon">
                <i class="fas fa-cart-shopping"></i>
              </span>
              <span>카트</span>
            </button>
        </li>
      </ul>
    </div>
  </div>
</div>
</nav>
`;

let navBar = "";
const isLogin = sessionStorage.getItem("token") ? true : false;
const nav = document.createElement("nav");

if (isLogin) {
  const makeMemberNav = async function () {
    const userRole = await Api.get("/api/user");
    const isAdmin = userRole.role === "admin-user" ? true : false;
    if (isAdmin) {
      navBar = adminNav;
    } else {
      navBar = memberNav;
    }
    nav.innerHTML = navBar;

    const logoutBtn = nav.querySelector(".logoutBtn");
    const cart = nav.querySelector(".cart");

    //카트가 비었을경우 카트로 진입할 수 없도록함
    cart.addEventListener("click", async () => {
      if (isAdmin) {
        if (!alert("일반 유저 계정으로 로그인해주세요."))
          document.location = window.location.href = "/login";
      } else {
        const result = await getCartisEmpty(); // result는 카트가 비었을때 true를, 비지 않았을때 false를 반환한다.
        if (result) {
          if (!alert("장바구니가 비었습니다."))
            document.location = window.location.href = "/cart";
        } else {
          window.location.href = "/cart";
        }
      }
    });

    //로그아웃 버튼 클릭시 세션스토리지 초기화
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault;
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("hashedEmail");
      window.location.href = "/";
    });
  };
  makeMemberNav();
}

if (!isLogin) {
  async function makeNonMemberNav() {
    navBar = nonMemberNav;
    nav.innerHTML = navBar;

    const cart = nav.querySelector(".cart");
    //카트가 비었을경우 카트로 진입할 수 없도록함
    cart.addEventListener("click", async () => {
      const result = await getCartisEmpty(); // result는 카트가 비었을때 true를, 비지 않았을때 false를 반환한다.
      if (result) {
        if (!alert("장바구니가 비었습니다."))
          document.location = window.location.href = "/cart";
      } else {
        window.location.href = "/cart";
      }
    });
  }
  makeNonMemberNav();
}

export { nav };
