import * as Api from "../api.js";
import { addCommas } from "../useful-functions.js";
import { nav } from "../nav/nav.js";

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement("afterbegin", nav);
}

const slideList = document.querySelector(".slideWrap");
const bookListContainer = document.querySelector(".bookListContainer");

const displayImage = function (ulId, _id, src, alt, title, price) {
  const parentUl = document.getElementById(ulId);
  parentUl.innerHTML += `
  <a href = "/book?id=${_id}">
  <li>
    <img src="${src}" alt="${alt}">
    <p class="title is-5">${title}</p>
    <p class="subtitle is-5">${addCommas(price)}원</p>
  </li></a>`;
};

const displayList = function (category, ulId, nowList) {
  bookListContainer.innerHTML += `
  <div class="bookList">
  <span class="category">${category}</span>
  <div class="listBox">
    <ul id=${ulId} class="bookListUl">

    </ul>
  </div>
  
  <a class="arrowPrev2" id=${'listArrowPrev' + ulId.substr(-1)} href="#">&#8810;</a>
  <a class="arrowNext2" id=${'listArrowNext' + ulId.substr(-1)} href="#">&#8811;</a>
  </div>`

  for (let i=0; i<nowList.length; i++){
    displayImage(ulId, nowList[i]._id, nowList[i].image, 'alt', nowList[i].title, nowList[i].price)
  }
};


// 렌더링 및 슬라이드 구현
const rendering = async function () {
  try {
    const allBookList = await Api.get("/api/book/booklist");

    //category list 뽑아오기
    let temp = [];
    for (let i = 0; i < allBookList.length; i++) {
      if (
        allBookList[i].category !== undefined &&
        allBookList[i].category !== "0"
      ) {
        temp.push(allBookList[i].category);
      }
    }
    let categoryList = [];
    temp.forEach((e) => {
      if (!categoryList.includes(e)) {
        categoryList.push(e);
      }
    });

    //컴퓨터IT 카테고리는 autoSlide에 적용
    const it = "컴퓨터IT";
    const itBooks = await Api.get("/api/books/category", it);
    for (let i = 0; i < itBooks.length; i++) {
      slideList.innerHTML += `<li class="slide"><img src=${itBooks[i].image}><a href='/book?id=${itBooks[i]._id}'>${itBooks[i].title}</a></li>`;
    }
    let bookListCategory = categoryList.filter((e) => e !== it);

    //나머지 카테고리 bookList에 적용
    for (let i = 0; i < bookListCategory.length; i++) {
      let nowList = allBookList.filter(
        (e) => e.category === bookListCategory[i]
      );
      displayList(nowList[0].category, `category${i}`, nowList);
    }
    
    //하단 click slide
    const allBookListUl = document.getElementsByClassName('bookListUl')
    let pages = [];
    let counts = [];
    const listWidth = document.querySelector('.bookList').offsetWidth;

    const prevClickSlide = function(slideName, pages, count, i) {
      if (count > 1) {
        count = count - 2;
        slideName.style.left = "-" + count * listWidth + "px";
        count++;
        counts[i] = count;
      } else if ((count = 1)) {
        count = pages - 1;
        slideName.style.left = "-" + count * listWidth + "px";
        count++;
        counts[i] = count;
      }
    }
    
    const nextClickSlide = function(slideName, pages, count, i) {
      if (count < pages) {
        slideName.style.left = "-" + count * listWidth + "px";
        count++;
        counts[i] = count;
      } else if ((count = pages)) {
        slideName.style.left = "0px";
        count = 1;
        counts[i] = count;
      }
    }

    for (let i=0; i<allBookListUl.length; i++){
      pages.push(Math.ceil((allBookListUl[i].querySelectorAll("a").length) / 6 ))
      counts.push(1)
    }

    for (let i=0; i<allBookListUl.length; i++){
      let closestBookList = allBookListUl[i].closest('.bookList')
      closestBookList.querySelector(`#listArrowPrev${i}`).addEventListener('click', (e)=>{
        e.preventDefault();
        prevClickSlide(allBookListUl[i], pages[i], counts[i], i);
      })

      closestBookList.querySelector(`#listArrowNext${i}`).addEventListener('click', (e)=>{
        e.preventDefault();
        nextClickSlide(allBookListUl[i], pages[i], counts[i], i);
      })
    }

  } catch (err) {
    console.log(err);
  }
};

// 상단 auto slide
const autoSlide = function () {
  const slider = document.querySelector(".slideContainer");
  let sliderWidth = slider.offsetWidth;
  const slideList = document.querySelector(".slideWrap");
  let count = 1;
  const slideListLength = 5;
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");

  window.addEventListener("resize", function () {
    sliderWidth = slider.offsetWidth;
  });

  const prevSlide = function () {
    if (count > 1) {
      count = count - 2;
      slideList.style.left = "-" + count * sliderWidth + "px";
      count++;
    } else if ((count = 1)) {
      count = slideListLength - 1;
      slideList.style.left = "-" + count * sliderWidth + "px";
      count++;
    }
  };

  const nextSlide = function () {
    if (count < slideListLength) {
      slideList.style.left = "-" + count * sliderWidth + "px";
      count++;
    } else if ((count = slideListLength)) {
      slideList.style.left = "0px";
      count = 1;
    }
  };

  next.addEventListener("click", function () {
    nextSlide();
  });

  prev.addEventListener("click", function () {
    prevSlide();
  });

  setInterval(function () {
    nextSlide();
  }, 5000);
};

autoSlide();
rendering();