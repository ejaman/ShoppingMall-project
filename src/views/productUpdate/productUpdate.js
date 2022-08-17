import * as Api from '/api.js'
import { nav } from '../nav/nav.js'

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement('afterbegin', nav)
}

const submitBtn = document.querySelector('#submitBtn');
const titleInput = document.querySelector('#titleInput');
const categoryInput = document.querySelector('#categoryInput');
const priceInput = document.querySelector('#priceInput');
const writerInput = document.querySelector('#writerInput');
const publisherInput = document.querySelector('#publisherInput');
const descriptionInput = document.querySelector('#descriptionInput');
const imageInput = document.querySelector('#imageInput');

const makeCategory = function( category, currentCategory ){
    if (category === currentCategory){
        categoryInput.innerHTML += `<option class="category" selected>${category}</option>`
    } else {
        categoryInput.innerHTML += `<option class="category">${category}</option>`
    }
}

const rendering = async function(){
    const urlParams = new URLSearchParams(window.location.search);
    const bookID = urlParams.get('id');
    const currentBook = await Api.get('/api/books', bookID);
    console.log(currentBook)
    //현재 값 value에 넣어주기
    titleInput.value = currentBook.title;
    priceInput.value = currentBook.price;
    writerInput.value = currentBook.author;
    publisherInput.value = currentBook.publisher;
    descriptionInput.value = currentBook.description;
    imageInput.value = currentBook.image;

    const allBookList = await Api.get("/api/book/booklist");

    //category list 뽑아오기
    let temp = []
    for (let i=0; i<allBookList.length; i++){
      if(allBookList[i].category !== undefined && allBookList[i].category !== "0"){
        temp.push(allBookList[i].category);
      }}
    let categoryList = [];
    temp.forEach((e) => {
      if (!categoryList.includes(e)){
        categoryList.push(e);
      }});
    
    let curr = '';
    //category넣어주기
    for (let i=0; i<categoryList.length; i++){
        curr = categoryList[i];
        makeCategory(curr, currentBook.category);
    }
}
rendering();

//수정
// const inputs = document.getElementsByTagName("input");
submitBtn.addEventListener('click', updateHandler)

async function updateHandler(e){
    e.preventDefault();

    const title = titleInput.value;
    const category = categoryInput.value;
    const price = priceInput.value;
    const author = writerInput.value;
    const publisher = publisherInput.value;
    const description = descriptionInput.value;
    const image = imageInput.value;

    if (!title) {
        return alert("책 이름을 입력해주세요.")
    }
    if (!price) {
        return alert("책 가격을 입력해주세요.")
    }
    if (!author) {
        return alert("저자를 입력해주세요.")
    }
    if (!publisher) {
        return alert("출판사를 입력해주세요.")
    }
    if (!description) {
        return alert("상품 설명을 입력해주세요.")
    }
    if (!image) {
        return alert("이미지URL을 입력해주세요.")
    }

    try {
        const data = {
            title,
            category,
            price,
            author,
            publisher,
            description,
            image
        };

        const urlParams = new URLSearchParams(window.location.search);
        const bookID = urlParams.get('id');

        await Api.patch('/api/book', bookID, data);
        alert('정상적으로 정보 수정되었습니다.');

        window.location.href = `/book/?id=${bookID}`
    } catch (err) {
        console.error(err.stack);
        alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
    }
}