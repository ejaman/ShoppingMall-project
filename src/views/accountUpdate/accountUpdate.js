import * as Api from "/api.js";
import { nav } from '../nav/nav.js'

addAllElements();

async function addAllElements() {
  insertNav();
}

function insertNav() {
  document.body.insertAdjacentElement('afterbegin', nav)
}

import { checkPhoneNumberValid } from "/useful-functions.js";

// 요소(element), input 혹은 상수
const fullNameInput = document.querySelector("#fullNameInput");
const passwordInput = document.querySelector("#passwordInput");
const currentPasswordInput = document.querySelector("#currentPasswordInput");
const passwordConfirmInput = document.querySelector("#passwordConfirmInput");
const postalCodeInput = document.querySelector("#postalCodeInput");
const address1Input = document.querySelector("#address1Input");
const address2Input = document.querySelector("#address2Input");
const phoneNumberInput = document.querySelector("#phoneNumberInput");
const securityTitle = document.querySelector("#securityTitle");

const searchAddressButton = document.querySelector("#searchAddressButton");
const saveButton = document.querySelector("#saveButton");
const cancelButton = document.querySelector("#cancelButton");
const deleteAccountButton = document.querySelector("#deleteAccountButton");

getUserInfo();
saveButton.addEventListener("click", updateHandler);
searchAddressButton.addEventListener("click", searchAddress);
cancelButton.addEventListener("click", cancelHandler);
deleteAccountButton.addEventListener("click", deleteHandler);

// 회원 탈퇴 버튼 클릭 시, 바로 회원 탈퇴 처리 됨.
async function deleteHandler(e) {
  e.preventDefault();
  try {
    const user = await Api.get("/api/user");
    const userId = user._id;
    const currentPassword = currentPasswordInput.value;
    const data = { currentPassword };

    if (!currentPassword) {
      return alert("현재 비밀번호를 입력해야 회원탈퇴 가능합니다.");
    }

    await Api.post("/api/checkPassword", data);
    await Api.delete("/api/users", userId, {});
    alert("회원탈퇴 처리되었습니다.");
    sessionStorage.removeItem("token");
    window.location.href = "/";
  } catch (err) {
    console.error(err.stack);
    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }
}

// 취소하기 버튼 클릭 시, accounts로 이동
function cancelHandler(e) {
  e.preventDefault();
  window.location.href = "/accounts-user";
}

// input에 기존 회원 정보 입력
async function getUserInfo() {
  const user = await Api.get("/api/user");
  const { email, fullName, address, phoneNumber } = user;
  const { postalCode, address1, address2 } = address;

  securityTitle.innerHTML = `회원정보 관리 (${email})`;
  fullNameInput.value = fullName;
  phoneNumberInput.value = phoneNumber;
  postalCodeInput.value = postalCode;
  address1Input.value = address1;
  address2Input.value = address2;
}

// 회원 정보 수정
async function updateHandler(e) {
  e.preventDefault();

  const fullName = fullNameInput.value;
  const currentPassword = currentPasswordInput.value;
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  const postalCode = postalCodeInput.value;
  const address1 = address1Input.value;
  const address2 = address2Input.value;
  const phoneNumber = phoneNumberInput.value;

  const address = { postalCode, address1, address2 };

  // 잘 입력했는지 확인
  const isFullNameValid = fullName.length >= 2;
  const isPasswordValid = password.length >= 4;
  const isPasswordSame = password === passwordConfirm;
  const isPhoneNumberValid = checkPhoneNumberValid(phoneNumber);

  if (fullName) {
    if (!isFullNameValid) {
      return alert("이름은 2글자 이상 입력해주세요.");
    }
  }

  if (password) {
    if (!isPasswordValid) {
      return alert("비밀번호는 4글자 이상이어야 합니다.");
    }
  }

  if (!isPasswordSame) {
    return alert("새 비밀번호가 일치하지 않습니다.");
  }

  if (!isPhoneNumberValid) {
    return alert(
      "잘못된 양식의 휴대폰 번호입니다. 010-xxxx-xxxx 양식으로 입력해주세요."
    );
  }

  // 유저 정보 수정 api 요청
  try {
    const data = {
      fullName,
      currentPassword,
      password,
      address,
      phoneNumber,
    };

    const user = await Api.get("/api/user");
    const userId = user._id;

    await Api.patch("/api/users", userId, data);
    alert(`정상적으로 정보 수정되었습니다.`);

    window.location.href = "";
  } catch (err) {
    console.error(err.stack);
    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }
}

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
      address2Input.value = "";
      address2Input.placeholder = "상세 주소를 입력해 주세요.";
      address2Input.focus();
    },
  }).open();
}
