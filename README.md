# GradSchool Landing

산업경영공학과 대학원 소개 홈페이지. 일반 방문자는 로그인 없이 열람/게시글 작성, 관리자만 로그인해 관리합니다.

```
frontend/   React + Vite (SPA)
backend/    Spring Boot 3.5 (Java 21, Gradle Wrapper, JPA, JWT)
```

## 기능
- **대학원 소개**: 메인 배너/소개/연구 분야/교육 과정/입학 안내 (관리자가 JSON으로 수정, 미수정 시 기본값 사용)
- **구성원 소개**: 교수·박사·석사·졸업생 프로필(사진, 연구 분야, 연락처 등), 관리자 CRUD + 사진 업로드
- **커뮤니티 게시판**: 공지/자유/질문/자료실, 검색·페이징·댓글. 일반 사용자는 닉네임+비밀번호로 작성·수정·삭제
- **관리자**: `/admin` 로그인(JWT) → 구성원·홈페이지 내용·공지/전체 게시글 관리, 비밀번호 변경

## 로컬 실행
```bash
# 1) 백엔드 (기본 H2 파일 DB, 포트 8080)
cd backend && ./gradlew bootRun

# 2) 프론트엔드 (포트 5173, /api 는 8080으로 프록시)
cd frontend && npm install && npm run dev
```
최초 관리자 계정: `admin` / `admin1234` (개발용 기본값 — 로그인 후 반드시 변경)

## 환경 변수 (backend)
| 이름 | 설명 | 기본값 |
|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | DB 접속 (운영은 PostgreSQL 권장) | H2 파일 |
| `JWT_SECRET` | JWT 서명 키 (32자 이상) | 개발용 값 — **운영에서 반드시 교체** |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | 관리자 계정이 없을 때만 최초 생성 | admin / admin1234 |
| `CORS_ORIGINS` | 허용 프론트 도메인(쉼표 구분) | http://localhost:5173 |
| `UPLOAD_DIR` | 업로드 이미지 저장 경로 | ./uploads |

## 배포 메모
- 프론트(Vercel): Root Directory `frontend`, Framework `Vite`. API 서버는 별도 호스팅이 필요하며,
  `frontend/vercel.json`의 rewrites에 `{ "source": "/api/:path*", "destination": "https://<백엔드 주소>/api/:path*" }`,
  `/uploads/:path*` 도 같은 방식으로 추가하세요.
- 백엔드: `./gradlew bootJar` → `build/libs/backend-0.0.1.jar`
