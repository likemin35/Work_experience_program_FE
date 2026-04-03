# Message Frontend Server

메시지 생성 프로젝트의 프론트엔드 저장소입니다. 마케터가 프로모션 PDF와 고객 CSV를 업로드하고, 세그먼트 결과와 메시지 초안을 확인 및 수정할 수 있는 웹 인터페이스를 제공합니다.

## 서비스 주소

- 운영 웹 서비스: https://message-fe-app.redriver-ce1c37ed.japaneast.azurecontainerapps.io/
- 별도 연동 플랫폼: https://marketing-platform-app.redriver-ce1c37ed.japaneast.azurecontainerapps.io/

## 프로젝트 개요

- 이 저장소는 3개 레포로 분리된 전체 시스템 중 프론트엔드를 담당합니다.
- React 기반 SPA로 구성되어 있으며 백엔드 API와 연결됩니다.
- 모든 서비스는 Azure Container Apps에 배포되어 있습니다.
- MCP를 통해 별도로 만든 플랫폼과 연결된 환경을 함께 사용하고 있습니다.

## 주요 화면과 기능

- 메인 랜딩 화면
- 프로모션 PDF 업로드
- 고객 CSV 업로드
- 캠페인별 세그먼트 결과 조회
- 세그먼트별 메시지 생성 요청
- 메시지 결과 조회 및 수정
- 결과 CSV 다운로드
- 캠페인 목록 조회

## 사용자 흐름

1. 사용자가 프로모션 PDF를 업로드합니다.
2. 사용자가 고객 CSV를 업로드합니다.
3. 백엔드가 캠페인 생성 및 고객 세그먼트를 완료합니다.
4. 세그먼트 결과 화면에서 메시지 생성을 실행합니다.
5. 생성된 메시지 초안을 확인하고 필요 시 수정합니다.
6. 최종 결과를 CSV로 다운로드합니다.

## 기술 스택

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Chart.js / react-chartjs-2
- Lucide React
- Docker
- Nginx
- Azure Container Apps

## 주요 디렉터리

- `src/pages`: 주요 페이지 컴포넌트
- `src/components`: 공통 UI 컴포넌트
- `src/api.ts`: Axios API 클라이언트 설정
- `src/assets`: 이미지 및 스타일 리소스
- `Dockerfile`: 프론트엔드 컨테이너 빌드 설정

## 로컬 실행

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

프론트엔드는 `VITE_API_BASE` 값을 사용해 백엔드 API를 호출합니다.

예시:

```bash
VITE_API_BASE=http://localhost:8080
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 프로덕션 빌드

```bash
npm run build
```

## 백엔드 연동

- Axios 인스턴스는 `VITE_API_BASE`를 기준으로 동작합니다.
- 개발 환경에서는 Vite 프록시를 통해 `/api` 요청을 `http://localhost:8080`으로 전달하도록 설정되어 있습니다.
- 캠페인 생성, 세그먼트 조회, 메시지 생성/수정, CSV 다운로드 기능이 모두 백엔드 API와 연결되어 있습니다.

## 배포

- 프론트엔드는 빌드 후 Nginx로 정적 파일을 서비스합니다.
- 모든 서버는 Azure Container Apps에 배포되어 있습니다.
- 운영 접근 주소는 아래와 같습니다.
  - https://message-fe-app.redriver-ce1c37ed.japaneast.azurecontainerapps.io/
  - https://marketing-platform-app.redriver-ce1c37ed.japaneast.azurecontainerapps.io/

## 관련 저장소

- Backend: https://github.com/likemin35/Work_experience_program_BE
- AI Server: https://github.com/likemin35/Work_experience_program_AI
