# Message Frontend Server

메시지 생성 프로젝트의 프론트엔드 저장소입니다. 사용자가 프로모션 PDF와 고객 CSV를 업로드하고, 캠페인 상태를 확인하며, 세그먼트 결과와 최종 메시지 결과를 다운로드할 수 있는 React 기반 웹 인터페이스를 제공합니다.

## 서비스 주소

- 운영 웹 서비스: https://message-fe-app.redriver-ce1c37ed.japaneast.azurecontainerapps.io/
- MCP 연동 플랫폼: https://marketing-platform-app.redriver-ce1c37ed.japaneast.azurecontainerapps.io/

## 프로젝트 개요

- 역할: React SPA 프론트엔드
- 배포 환경: Azure Container Apps
- 상태 갱신 방식: polling
- 백엔드 연동 방식: REST API

## 현재 사용자 흐름

1. 사용자가 프로모션 PDF와 고객 CSV를 한 번에 업로드합니다.
2. 업로드가 완료되면 캠페인이 즉시 생성되고 `UPLOADED` 상태로 목록에 표시됩니다.
3. 사용자가 타겟 분류 버튼을 누르면 즉시 `SEGMENTING` 상태로 바뀌고, 백그라운드 Job이 분류를 처리합니다.
4. 분류가 완료되면 `SEGMENTED` 상태가 되고 그룹화 CSV 다운로드와 메시지 생성 버튼이 활성화됩니다.
5. 사용자가 메시지 생성 버튼을 누르면 즉시 `MESSAGE_GENERATING` 상태로 바뀌고, 백그라운드 Job이 메시지 생성을 처리합니다.
6. 완료되면 `MESSAGE_GENERATED` 상태가 되고 최종 message CSV 다운로드와 메시지 결과 조회가 가능합니다.

## 상태값 표시

- `UPLOADED`: 업로드 완료
- `SEGMENTING`: 분류 중
- `SEGMENTED`: 분류 완료
- `MESSAGE_GENERATING`: 메시지 생성 중
- `MESSAGE_GENERATED`: 메시지 생성 완료
- `SEGMENT_FAILED`: 분류 실패
- `MESSAGE_FAILED`: 메시지 생성 실패

## 주요 화면

- 캠페인 생성 화면
- 캠페인 목록 화면
- 세그먼트 상태 / 결과 화면
- 메시지 상태 / 결과 화면
- 메시지 수정 화면

## 주요 기능

- 프로모션 PDF + 고객 CSV 업로드
- 캠페인 목록 조회
- 상태 polling
- segmentation job 등록
- message generation job 등록
- grouped CSV 다운로드
- message CSV 다운로드
- 생성된 메시지 조회 및 수정

## 기술 스택

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Lucide React
- Docker
- Nginx
- Azure Container Apps

## 주요 파일

- `src/pages/CampaignCreationPage.tsx`
  - PDF/CSV 업로드
- `src/pages/CampaignListPage.tsx`
  - 캠페인 목록과 상태 polling
- `src/pages/CampaignSegmentResultPage.tsx`
  - 캠페인 상세 상태, segmentation job 등록, grouped CSV 다운로드
- `src/pages/MessageResultPage.tsx`
  - 메시지 상태, 결과 조회, 최종 CSV 다운로드
- `src/pages/MessageEditPage.tsx`
  - 메시지 수정
- `src/api.ts`
  - Axios API 클라이언트

## 백엔드 연동 API

- `POST /api/campaigns`
- `POST /api/campaigns/{campaignId}/segmentation-jobs`
- `POST /api/campaigns/{campaignId}/message-generation-jobs`
- `GET /api/campaigns`
- `GET /api/campaigns/{campaignId}`
- `GET /api/campaigns/{campaignId}/segments`
- `GET /api/campaigns/{campaignId}/segmented-csv`
- `GET /api/campaigns/{campaignId}/messages`
- `GET /api/campaigns/{campaignId}/message-csv`
- `PATCH /api/campaigns/messages/{resultId}`

## 로컬 실행

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
VITE_API_BASE=http://localhost:8080
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 타입 확인

```bash
npx tsc -b
```

### 5. 프로덕션 빌드

```bash
npm run build
```

## 배포

- 프론트엔드는 빌드 후 Nginx로 정적 파일을 서비스합니다.
- Azure Container Apps에 배포되어 있습니다.
- 백엔드의 비동기 상태 전이와 Queue/Job 처리 결과를 polling으로 화면에 반영합니다.

## 관련 저장소

- Backend: https://github.com/likemin35/Work_experience_program_BE
- AI Server: https://github.com/likemin35/Work_experience_program_AI
