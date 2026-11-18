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

## 배포 (무료 구성: Vercel + Render + Neon)
1. **DB (Neon)**: 프로젝트 생성 후 접속 정보를 `DB_URL=jdbc:postgresql://<host>/<db>?sslmode=require`, `DB_USERNAME`, `DB_PASSWORD` 로 준비.
2. **백엔드 (Render)**: New → Web Service → 이 저장소 연결, Language `Docker`, Root Directory `backend`, Instance Type `Free`.
   환경변수: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`(32자 이상 랜덤), `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
   `CORS_ORIGINS`(Vercel 도메인). Health Check Path 는 `/api/members` 로 지정.
3. **프론트 (Vercel)**: `frontend/vercel.json` 의 `REPLACE-WITH-YOUR-SERVICE.onrender.com` 을 Render 주소로 교체 후 push.
   (`/api`, `/uploads` 요청이 백엔드로 프록시되어 CORS 없이 동작)
4. **슬립 방지**: Render 무료 서비스는 15분 무요청 시 슬립(첫 요청 40~60초). UptimeRobot 으로
   `https://<render 주소>/api/members` 를 5~10분마다 호출하면 깨어 있습니다.

- 업로드 이미지는 DB(`uploaded_file`)에 저장됩니다 (디스크가 휘발성인 무료 호스팅 대응, 파일당 5MB 제한).
- 백엔드 jar 빌드: `./gradlew bootJar` → `build/libs/backend-0.0.1.jar`
