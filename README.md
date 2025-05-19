# Maplestory
### [메이플스토리 PC] 웹 백엔드 엔지니어 과제

<br>

# MSA 구조

![msa](https://github.com/user-attachments/assets/616af209-d702-4856-86d3-5b4169275571)


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

# 실행 방법

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

# 과제 설계
### 1. 각 서버마다 통신방법은 어떤 것을 사용하지?
초기에는 `kafka`를 활용한 이벤트 기반 통신을 적용하려고 생각했습니다.  
이를 통해 비동기적으로, 각 서버들이 장애가 발생해도 오류 전파를 막고 유연하게 대처할 수 있다고 예상했습니다.  
하지만 무조건 동기적으로 응답을 해야하는 요청들이 많았고, `http` 통신으로도 충분히 사용하는 것에 무리가 없다고 판단했습니다.  
결론적으로 `http` 통신을 적용해서 각 서버마다 통신하도록 구현했습니다.

<br>

### 2. 보상 신청 중복을 막으려면 어떤식으로 구현해야하지?
우선 가장 먼저 떠오른 방법이 로컬 메모리에서 전역으로 `spin lock` 객체를 두어 동시성을 제어하는 것 입니다.  
현재 모든 서버들이 한대씩만 돌아가도록 설정해두어서 크게 문제되지 않는 방법이였습니다.  
하지만 MSA 기반의 아키텍처는 기본적으로 `scale-out`을 고려해야 했고, 해당 방법은 전혀 좋지 못한 방법이라고 판단했습니다.  
그래서 분산락을 활용할 수 있도록 `redis redlock`을 사용하는 방법을 적용했습니다.  
서버가 증가돼서 여러 서버에서의 동시성 문제가 발생한다하더라도 분산락을 통해 동시성을 제어할 수 있다고 판단했습니다.  

<br>

### 3. 보상 획득 기준은 어떤식으로 설계하지?
이벤트 보상에 대해 어떤식으로 지급할지 고민했습니다.  
초기 설계에서는 이벤트도 종류는 초대, 출석 이벤트로 분류하고, 보상 종류는 쿠폰, 아이템, 포인트로 분류했습니다.  
하지만 마감기간 내에 이벤트 종류 별로 완료 여부를 검사하고, 보상 종류 별로 지급하는 것이 쉽지 않겠다는 생각을 했습니다.  
그래서 이벤트 완료 여부 및 보상 지급을 운영자 또는 관리자가 직접 판단할 수 있도록 설계를 변경했습니다.  
각 유저는 모든 이벤트에 대해 보상 신청을 하면, 운영자 또는 관리자가 해당 보상 신청을 승인하거나 거부하도록 구현했습니다.  

<br>

# API 사용 방법

### HOST - https://localhost:3001

<br>

## 1. AUTH

### 회원가입

**[ Request ]**

```http
POST /auth/signup HTTP/1.1
Content-Type: application/json;charset=UTF-8
Accept: application/json
Host: localhost:3001

{
  "email": "user@google.com",
  "password": "qwer1234@@AA"
  "role": "USER"
}
```

<br>

**[ Request Body ]**

| 필드명   | 타입   | 필수 | 설명                                                         |
|----------|--------|------|--------------------------------------------------------------|
| email    | string | ✅   | 이메일 형식의 문자열                                          |
| password | string | ✅   | 비밀번호                                                     |
| role     | string | ❌(default USER)   | 권한 (USER, OPERATOR, AUDITOR, ADMIN)                        |

<br>


### 로그인

---

**[ Request ]**

```http
POST /auth/signin HTTP/1.1
Content-Type: application/json;charset=UTF-8
Accept: application/json
Host: localhost:3001

{
  "email": "user@google.com",
  "password": "qwer1234@@AA"
}
```

<br>

**[ Request Body ]**

| 필드명   | 타입   | 필수 | 설명     |
|----------|--------|------|----------|
| email    | string | ✅   | 이메일   |
| password | string | ✅   | 비밀번호 |

<br>


### 로그아웃

---

**[ Request ]**

```http
PATCH /auth/signout HTTP/1.1
Authorization: Bearer eyJhbGciOi...xyz
Host: localhost:3001
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

### 리프레쉬

---

**[ Request ]**

```http
PATCH /auth/refresh HTTP/1.1
Content-Type: application/json;charset=UTF-8
Host: localhost:3001

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

<br>

**[ Request Body ]**

| 필드명       | 타입   | 필수 | 설명              |
|--------------|--------|------|-------------------|
| refreshToken | string | ✅   | 리플레쉬 토큰 값  |

<br>

### 회원탈퇴

---

**[ Request ]**

```http
DELETE /auth/withdraw HTTP/1.1
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

## 2. EVENT

### 활성화된 이벤트 목록 조회
---

**[ Request ]**

```http
GET /event?order=ASC&pageNumber=1&pageSize=10 HTTP/1.1
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Query Parameters ]**

| 이름       | 타입   | 필수 | 설명                       |
|------------|--------|------|----------------------------|
| pageNumber | number | ✅    | 페이지 번호              |
| pageSize   | number | ✅    | 한 페이지 크기            |
| order      | string | ✅   | 정렬 순서 (ASC / DESC)    |

<br>

### 이벤트 상세 조회

---

**[ Request ]**

```http
GET /event/682aedd6968327649d82cc00 HTTP/1.1
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Path Parameter ]**

| 이름     | 타입   | 필수 | 설명         |
|----------|--------|------|--------------|
| id  | string | ✅   | 이벤트 ID    |

<br>

### 이벤트 등록 (관리자용)

---

**[ Request ]**

```http
POST /admin/event HTTP/1.1
Content-Type: application/json;charset=UTF-8
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001

{
  "title": "출석 이벤트",
  "description": "매일 출석해서 이벤트 참여하세요.",
  "startedAt": "2025-06-01T00:00:00",
  "expiredAt": "2025-06-30T00:00:00",
  "type": "ATTENDANCE",
  "active": true
}
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Request Body ]**

| 필드명        | 타입     | 필수 | 설명                     |
|---------------|----------|------|--------------------------|
| title         | string   | ✅   | 이벤트 제목              |
| description   | string   | ✅   | 이벤트 설명              |
| startedAt     | string   | ✅   | 시작일시       |
| expiredAt       | string   | ✅   | 종료일시      |
| type    | string   | ✅   | 이벤트 타입(ATTENDANCE, INVITATION)     |
| active       | boolean   | ✅   | 활성화 여부      |

<br>

### 모든 이벤트 목록 조회 (관리자용)

---

**[ Request ]**

```http
GET /admin/event?order=ASC&pageNumber=1&pageSize=10 HTTP/1.1
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Query Parameters ]**

| 이름       | 타입   | 필수 | 설명                       |
|------------|--------|------|----------------------------|
| pageNumber | number | ✅    | 페이지 번호              |
| pageSize   | number | ✅    | 한 페이지 크기            |
| order      | string | ✅   | 정렬 순서 (ASC / DESC)    |

<br>

### 이벤트 상세 조회 (관리자용)

---

**[ Request ]**

```http
GET /admin/event/682aedd6968327649d82cc00 HTTP/1.1
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Path Parameter ]**

| 이름     | 타입   | 필수 | 설명         |
|----------|--------|------|--------------|
| id  | string | ✅   | 이벤트 ID    |

<br>

## 3. REWARD

### 모든 보상 목록 조회

---

**[ Request ]**

```http
GET /reward?order=ASC&pageNumber=1&pageSize=10 HTTP/1.1
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Query Parameters ]**

| 이름       | 타입   | 필수 | 설명                       |
|------------|--------|------|----------------------------|
| pageNumber | number | ✅    | 페이지 번호              |
| pageSize   | number | ✅    | 한 페이지 크기            |
| order      | string | ✅   | 정렬 순서 (ASC / DESC)    |


<br>

### 보상 상세 조회

---

**[ Request ]**

```http
GET /reward/682aedd6968327649d82cc00 HTTP/1.1
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Path Parameter ]**

| 이름     | 타입   | 필수 | 설명         |
|----------|--------|------|--------------|
| id  | string | ✅   | 이벤트 ID    |

<br>

### 보상 신청

---

<br>

**[ Request ]**

```http
POST /reward/application HTTP/1.1
Content-Type: application/json;charset=UTF-8
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001

{
  "rewardId": "682aedd6968327649d82cc00"
}
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Request Body ]**

| 필드명        | 타입     | 필수 | 설명                     |
|---------------|----------|------|--------------------------|
| rewardId         | string   | ✅   | 보상 ID              |

<br>

### 자신의 신청 목록 조회

---

**[ Request ]**

```http
GET /reward/application/list?order=ASC&pageNumber=1&pageSize=10 HTTP/1.1
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Query Parameters ]**

| 이름       | 타입   | 필수 | 설명                       |
|------------|--------|------|----------------------------|
| pageNumber | number | ✅    | 페이지 번호              |
| pageSize   | number | ✅    | 한 페이지 크기            |
| order      | string | ✅   | 정렬 순서 (ASC / DESC)    |

<br>

### 보상 등록 (관리자용)

---

**[ Request ]**

```http
POST /admin/reward HTTP/1.1
Content-Type: application/json;charset=UTF-8
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001

{
  "eventId": "682aedd6968327649d82cc00"
  "title": "출석 보상",
  "description": "출석 이벤트 보상입니다.",
  "startedAt": "2025-06-01T00:00:00",
  "expiredAt": "2025-06-30T00:00:00",
  "type": "COUPON",
  "quantity": 1000
}
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Request Body ]**

| 필드명        | 타입     | 필수 | 설명                     |
|---------------|----------|------|--------------------------|
| eventId         | string   | ✅   | 이벤트 ID              |
| title         | string   | ✅   | 보상 제목              |
| description   | string   | ✅   | 보상 설명              |
| startedAt     | string   | ✅   | 시작일시       |
| expiredAt       | string   | ✅   | 종료일시      |
| type    | string   | ✅   | 보상 타입(COUPON, ITEM, POINT)     |
| quantity       | number   | ✅   | 보상 수량      |

<br>


### 보상 상세 조회 (관리자용)

---

**[ Request ]**

```http
GET /admin/reward/682aedd6968327649d82cc00 HTTP/1.1
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Path Parameter ]**

| 이름     | 타입   | 필수 | 설명         |
|----------|--------|------|--------------|
| id  | string | ✅   | 이벤트 ID    |

<br>


### 모든 신청 목록 조회 (관리자용)

---

**[ Request ]**

```http
GET /admin/reward/application?order=ASC&pageNumber=1&pageSize=10 HTTP/1.1
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Query Parameters ]**

| 이름       | 타입   | 필수 | 설명                       |
|------------|--------|------|----------------------------|
| pageNumber | number | ✅    | 페이지 번호              |
| pageSize   | number | ✅    | 한 페이지 크기            |
| order      | string | ✅   | 정렬 순서 (ASC / DESC)    |

<br>

### 보상 신청 승인 (관리자용)

---

**[ Request ]**

```http
PATCH /admin/reward/application HTTP/1.1
Content-Type: application/json;charset=UTF-8
Authorization: Bearer eyJhbGciOi...abc
Host: localhost:3001

{
  "id": "682aedd6968327649d82cc00"
  "approved": true
}
```

<br>

**[ Headers ]**

| 이름          | 필수 | 설명               |
|---------------|------|--------------------|
| Authorization | ✅   | Bearer 액세스 토큰 |

<br>

**[ Request Body ]**

| 필드명        | 타입     | 필수 | 설명                     |
|---------------|----------|------|--------------------------|
| id         | string   | ✅   | 보상 신청 ID              |
| approved         | boolean   | ✅   | 승인 여부              |


<br>
