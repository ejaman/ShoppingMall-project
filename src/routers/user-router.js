import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { adminRequired } from "../middlewares";
import { userService } from "../services";

const userRouter = Router();

// 회원가입 api (아래는 /register이지만, 실제로는 /api/register로 요청해야 함.)
userRouter.post("/register", async (req, res, next) => {
  try {
    if (is.emptyObject(req.body)) {
      throw new Error(
        "headers의 Content-Type을 application/json으로 설정해주세요"
      );
    }

    // req (request)의 body 에서 데이터 가져오기
    const { fullName, email, password, phoneNumber, address } = req.body;
    // console.log(req.body);

    // 위 데이터를 유저 db에 추가하기
    const newUser = await userService.addUser({
      fullName,
      email,
      password,
      phoneNumber,
      address,
    });
    console.log(newUser);

    // 추가된 유저의 db 데이터를 프론트에 다시 보내줌
    // 물론 프론트에서 안 쓸 수도 있지만, 편의상 일단 보내 줌
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// 로그인 api (아래는 /login 이지만, 실제로는 /api/login로 요청해야 함.)
userRouter.post("/login", async function (req, res, next) {
  try {
    // application/json 설정을 프론트에서 안 하면, body가 비어 있게 됨.
    if (is.emptyObject(req.body)) {
      throw new Error(
        "headers의 Content-Type을 application/json으로 설정해주세요"
      );
    }
    // req (request) 에서 데이터 가져오기
    const email = req.body.email;
    const password = req.body.password;

    // 로그인 진행 (로그인 성공 시 jwt 토큰을 프론트에 보내 줌)
    const userToken = await userService.getUserToken({ email, password });

    // jwt 토큰을 프론트에 보냄 (jwt 토큰은, 문자열임)
    res.status(200).json(userToken);
  } catch (error) {
    next(error);
  }
});

// 전체 유저 목록을 가져옴 (배열 형태임)
// 미들웨어로 loginRequired 를 썼음 (이로써, jwt 토큰이 없으면 사용 불가한 라우팅이 됨)
userRouter.get("/userlist", adminRequired, async function (req, res, next) {
  try {
    // 전체 사용자 목록을 얻음
    const users = await userService.getUsers();

    // 사용자 목록(배열)을 JSON 형태로 프론트에 보냄
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// 로그인 유저의 userId 가져옴
userRouter.get("/user", loginRequired, async function (req, res, next) {
  try {
    const userId = req.currentUserId;
    const user = await userService.getUser(userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// 유저 정보 수정 전 현재 비밀번호 확인 --> post password를 body에 담아서 요청
userRouter.post(
  "/checkPassword",
  loginRequired,
  async function (req, res, next) {
    try {
      const userId = req.currentUserId;
      const currentPassword = req.body.currentPassword;
      const userInfoRequired = { userId, currentPassword };
      await userService.checkUser(userInfoRequired);
      res.status(200).json("비밀번호가 일치합니다.");
    } catch (error) {
      next(error);
    }
  }
);

// 사용자 정보 수정
userRouter.patch(
  "/users/:userId",
  loginRequired,
  async function (req, res, next) {
    try {
      // content-type 을 application/json 로 프론트에서
      // 설정 안 하고 요청하면, body가 비어 있게 됨.
      if (is.emptyObject(req.body)) {
        throw new Error(
          "headers의 Content-Type을 application/json으로 설정해주세요"
        );
      }

      // params로부터 id를 가져옴
      const userId = req.params.userId;
      if (req.role !== "admin-user") {
        if (req.currentUserId !== userId) {
          throw new Error("토큰의 정보와 수정하려는 유저의 정보가 다릅니다.");
        }
      }
      // body data 로부터 업데이트할 사용자 정보를 추출함.
      const { fullName, password, address, phoneNumber, role } = req.body;

      // body data로부터, 확인용으로 사용할 현재 비밀번호를 추출함.
      const currentPassword = req.body.currentPassword;
      const userRole = req.role;
      const userInfoRequired = { userId, currentPassword };

      // 보내주었다면, 업데이트용 객체에 삽입함.
      const toUpdate = {
        ...(fullName && { fullName }),
        ...(password && { password }),
        ...(address && { address }),
        ...(phoneNumber && { phoneNumber }),
        ...(role && { role }),
      };

      // 사용자 정보를 업데이트함.
      const updatedUserInfo = await userService.setUser(
        userRole,
        userInfoRequired,
        toUpdate
      );

      // 업데이트 이후의 유저 데이터를 프론트에 보내 줌
      res.status(200).json(updatedUserInfo);
    } catch (error) {
      next(error);
    }
  }
);

// 회원탈퇴 userId를 파라미터에 넣어서 전송
userRouter.delete(
  "/users/:userId",
  loginRequired,
  async function (req, res, next) {
    try {
      const userId = req.params.userId;

      // 관리자 계정이 아니라면 유저 아이디 일치하는지 검증
      if (req.role !== "admin-user") {
        if (req.currentUserId !== userId) {
          throw new Error("토큰의 정보와 삭제하려는 유저의 정보가 다릅니다.");
        }
      }
      await userService.deleteUser(userId);

      res.status(200).json("정상적으로 회원탈퇴 처리 되었습니다.");
    } catch (error) {
      next(error);
    }
  }
);

export { userRouter };
