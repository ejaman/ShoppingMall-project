import * as Api from "/api.js";
import { validateEmail, checkPhoneNumberValid } from "/useful-functions.js";
import { nav } from '../nav/nav.js'

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement('afterbegin', nav)
}

// 요소(element), input 혹은 상수
const fullNameInput = document.querySelector("#fullNameInput");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const passwordConfirmInput = document.querySelector("#passwordConfirmInput");
const postalCodeInput = document.querySelector("#postalCode");
const address1Input = document.querySelector("#address1");
const address2Input = document.querySelector("#address2");
const phoneNumberInput = document.querySelector("#phoneNumberInput");

const searchAddressButton = document.querySelector("#searchAddressButton");
const submitButton = document.querySelector("#submitButton");

searchAddressButton.addEventListener("click", searchAddress);
submitButton.addEventListener("click", submitHandler);

function searchAddress(e) {
  e.preventDefault();
  new daum.Postcode({
    oncomplete: function (data) {
      let addr = "";
      let extraAddr = "";

      if (data.userSelectedType === "R") {
        addr = data.roadAddress;
      } else {
        addr = data.jibunAddress;
      }

      if (data.userSelectedType === "R") {
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }
        if (extraAddr !== "") {
          extraAddr = " (" + extraAddr + ")";
        }
      } else {
      }
      postalCodeInput.value = data.zonecode;
      address1Input.value = `${addr} ${extraAddr}`;
      address2Input.placeholder = "상세 주소를 입력해 주세요.";
      address2Input.focus();
    },
  }).open();
}

// 회원가입 진행
async function submitHandler(e) {
  e.preventDefault();

  const fullName = fullNameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  const postalCode = postalCodeInput.value;
  const address1 = address1Input.value;
  const address2 = address2Input.value;
  const phoneNumber = phoneNumberInput.value;

  const address = { postalCode, address1, address2 };

  // 잘 입력했는지 확인
  const isFullNameValid = fullName.length >= 2;
  const isEmailValid = validateEmail(email);
  const isPasswordValid = password.length >= 4;
  const isPasswordSame = password === passwordConfirm;
  const isPhoneNumberValid = checkPhoneNumberValid(phoneNumber);

  if (!isFullNameValid || !isPasswordValid) {
    return alert("이름은 2글자 이상, 비밀번호는 4글자 이상이어야 합니다.");
  }

  if (!isEmailValid) {
    return alert("이메일 형식이 맞지 않습니다.");
  }

  if (!isPasswordSame) {
    return alert("비밀번호가 일치하지 않습니다.");
  }

  if (!isPhoneNumberValid) {
    return alert(
      "잘못된 양식의 휴대폰 번호입니다. 010-xxxx-xxxx 양식으로 입력해주세요."
    );
  }

  // 회원가입 api 요청
  try {
    const data = {
      fullName,
      email,
      password,
      address,
      phoneNumber,
    };

    await Api.post("/api/register", data);
    alert(`정상적으로 회원가입되었습니다.`);

    // 로그인 페이지 이동
    window.location.href = "/login";
  } catch (err) {
    console.error(err.stack);
    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }
}
