# Maplestory
### [메이플스토리 PC] 웹 백엔드 엔지니어 과제

<br>

## 폴더 구조

```
project-root/
├── apps/
│   ├── gateway-server/
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   ├── auth/                 ## 유저 기능 라우팅
│   │   │   ├── event/                ## 이벤트, 보상 기능 라우팅
│   │   │   └── global/
│   │   ├── .env
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── auth-server/
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   ├── auth/                 ## 유저 기능
│   │   │   └── global/
│   │   ├── .env
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   └── event-server/
│       ├── src/
│       │   ├── app.module.ts
│       │   ├── main.ts
│       │   ├── event/                ## 이벤트, 보상 기능
│       │   └── global/
│       ├── .env
│       ├── package.json
│       ├── tsconfig.json
│       └── Dockerfile
│
├── docker-compose.yaml
├── package.json
├── tsconfig.json
├── pnpm-workspace.yaml
└── node_modules/
```

<br>

## 실행 방법

```bash
git clone https://github.com/jjeonghak/Maplestory.git maplestory
cd maplestory
```
* 우선 레포지토리 클론을 받아주세요.

<br>


```bash
docker-compose up --build
```

* `.env` 파일은 민감한 정보가 없어서 올려두었습니다.
* `gateway-server` 포트는 `3001`번으로 열어두었습니다.

<br>

## 과제 설계
### 각 서버마다 통신방법은 어떤 것을 사용하지?
초기에는 `kafka`를 활용한 이벤트 기반 통신을 적용하려고 생각했습니다.  
이를 통해 비동기적으로, 각 서버들이 장애가 발생해도 오류 전파를 막고 유연하게 대처할 수 있다고 예상했습니다.  
하지만 무조건 동기적으로 응답을 해야하는 요청들이 많았고, `http` 통신으로도 충분히 사용하는 것에 무리가 없다고 판단했습니다.  
결론적으로 `http` 통신을 적용해서 각 서버마다 통신하도록 구현했습니다.

<br>

### 보상 신청 중복을 막으려면 어떤식으로 구현해야하지?
우선 가장 먼저 떠오른 방법이 로컬 메모리에서 전역으로 `spin lock` 객체를 두어 동시성을 제어하는 것 입니다.  
현재 모든 서버들이 한대씩만 돌아가도록 설정해두어서 크게 문제되지 않는 방법이였습니다.  
하지만 MSA 기반의 아키텍처는 기본적으로 `scale-out`을 고려해야 했고, 해당 방법은 전혀 좋지 못한 방법이라고 판단했습니다.  
그래서 분산락을 활용할 수 있도록 `redis redlock`을 사용하는 방법을 적용했습니다.  
서버가 증가돼서 여러 서버에서의 동시성 문제가 발생한다하더라도 분산락을 통해 동시성을 제어할 수 있다고 판단했습니다.  

<br>

### 보상 획득 기준은 어떤식으로 설계하지?
이벤트 보상에 대해 어떤식으로 지급할지 고민했습니다.  
초기 설계에서는 이벤트도 종류는 초대, 출석 이벤트로 분류하고, 보상 종류는 쿠폰, 아이템, 포인트로 분류했습니다.  
하지만 마감기간 내에 이벤트 종류 별로 완료 여부를 검사하고, 보상 종류 별로 지급하는 것이 쉽지 않겠다는 생각을 했습니다.  
그래서 이벤트 완료 여부 및 보상 지급을 운영자 또는 관리자가 직접 판단할 수 있도록 설계를 변경했습니다.  
각 유저는 모든 이벤트에 대해 보상 신청을 하면, 운영자 또는 관리자가 해당 보상 신청을 승인하거나 거부하도록 구현했습니다.  

<br>

## API 사용 방법

### HOST - https://localhost:3001

<br>

### 1. AUTH

| **METHOD** | **PATH** | **PARAM** | **QUERY** | **BODY** | **AUTH** | **DESCRIPTION** |
|--|--|--|--|--|--|--|
| **POST** | `/auth/signup` | - | - | `email` - 이메일 형식의 문자열 <br> `password` - 비밀번호 <br> `role` - 권한(optional) | - | 회원가입 |
| **POST** | `/auth/signin` | - | - | `email` - 이메일 형식의 문자열 <br> `password` - 비밀번호 | - | 로그인 |
| **PATCH** | `/auth/signout` | - | - | - | JWT | 로그아웃 |
| **PATCH** | `/auth/refresh` | - | - | `refreshToken` - 리플레쉬 토큰값 | - | 리플레쉬 |
| **DELETE** | `/auth/withdraw` | - | - | - | JWT | 회원탈퇴 |

* 권한(`role`)은 `USER`, `OPERATOR`, `AUDITOR`, `ADMIN`
* 기본적으로 JWT 토큰 사용시, `Bearer ` 접두사 필수
* 리플레쉬 토큰은 `Bearer ` 접두사없이 바디에 넣어서 사용

<br>

### 2. EVENT

| **METHOD** | **PATH** | **PARAM** | **QUERY** | **BODY** | **AUTH** | **DESCRIPTION** |
|--|--|--|--|--|--|--|
| **GET** | `/event` | - | `order` - 정렬방법(ASC, DESC) <br> `pageNumber` - 페이지 번호 <br> `pageSize` - 페이지 크기 | - | JWT | 활성화된 이벤트 목록 조회 |
| **GET** | `/event` | `id` - 이벤트 아이디 | - | - | JWT | 활성화된 이벤트 상세 조회 |

<br>

### 2-1. EVENT-ADMIN

| **METHOD** | **PATH** | **PARAM** | **QUERY** | **BODY** | **AUTH** | **DESCRIPTION** |
|--|--|--|--|--|--|--|
| **POST** | `/admin/event` | - | - | `title` - 이벤트 이름 <br> `description` - 이벤트 설명 <br> `type` - 이벤트 타입 <br> `startedAt` - 이벤트 시작일시 <br> `expiredAt` - 이벤트 종료일시 <br> `active` - 이벤트 활성화여부 | JWT | 이벤트 생성 |
| **GET** | `/admin/event` | - | `order` - 정렬방법(ASC, DESC) <br> `pageNumber` - 페이지 번호 <br> `pageSize` - 페이지 크기 | - | JWT | 모든 이벤트 목록 조회 |
| **GET** | `/admin/event` | `id` - 이벤트 아이디 | - | - | JWT | 이벤트 상세 조회 |

* 이벤트 타입(`type`)은 `ATTENDANCE`, `INVITATION`

<br>


### 3. REWARD
| **METHOD** | **PATH** | **PARAM** | **QUERY** | **BODY** | **AUTH** | **DESCRIPTION** |
|--|--|--|--|--|--|--|
| **GET** | `/reward` | - | `order` - 정렬방법(ASC, DESC) <br> `pageNumber` - 페이지 번호 <br> `pageSize` - 페이지 크기 | - | JWT | 모든 보상 목록 조회 |
| **GET** | `/reward` | `id` - 보상 아이디 | - | - | JWT | 보상 상세 조회 |
| **POST** | `/reward/application` | - | - | `rewardId` - 보상 아이디 | JWT | 보상 신청 |
| **GET** | `/reward/application/list` | - | `order` - 정렬방법(ASC, DESC) <br> `pageNumber` - 페이지 번호 <br> `pageSize` - 페이지 크기 | - | JWT | 자신의 신청 목록 조회 |


<br>

### 3-1. REWARD-ADMIN
| **METHOD** | **PATH** | **PARAM** | **QUERY** | **BODY** | **AUTH** | **DESCRIPTION** |
|--|--|--|--|--|--|--|
| **POST** | `/admin/reward` | - | - | `eventId` - 이벤트 아이디 <br> `title` - 보상 이름 <br> `description` - 보상 설명 <br> `type` - 보상 타입 <br> `startedAt` - 보상 시작일시 <br> `expiredAt` - 보상 종료일시 <br> `quantity` - 보상 수량 | JWT | 보상 생성 |
| **GET** | `/admin/reward` | `id` - 보상 아이디 | - | - | JWT | 보상 상세 조회 |
| **GET** | `/admin/reward/application` | - | `order` - 정렬방법(ASC, DESC) <br> `pageNumber` - 페이지 번호 <br> `pageSize` - 페이지 크기 | - | JWT | 모든 유저의 신청 목록 조회 |
| **PATCH** | `/admin/reward/application` | - | - | `id` - 신청 아이디 <br> `approved` - 승인 여부 | JWT | 신청 승인 |

* 보상 타입(`type`)은 `COUPON`, `ITEM`, `POINT`

<br>