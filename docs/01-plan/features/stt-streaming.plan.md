---
template: plan
version: 1.2
description: PDCA Plan phase document template with Architecture and Convention considerations
variables:
  - feature: stt-streaming
  - date: 2026-08-01
  - author: bkit Master Agent
  - project: mobile-to-pc-STT
  - version: 1.0.0
---

# stt-streaming Planning Document

> **Summary**: 모바일 기기의 음성을 실시간 스트리밍하여 PC에서 Google STT를 통해 텍스트로 변환 및 표시
>
> **Project**: mobile-to-pc-STT
> **Version**: 1.0.0
> **Author**: bkit Master Agent
> **Date**: 2026-08-01
> **Status**: Draft

---

## Context Anchor

| Dimension | Content |
|-----------|---------|
| WHY | 모바일 기기의 마이크를 이용해 음성을 입력받고 PC에서 실시간으로 텍스트 변환 결과를 확인하기 위함 |
| WHO | 모바일(웹/앱) 환경에서 발화하고 PC 화면에서 텍스트를 모니터링하려는 사용자 |
| RISK | 1. 실시간 오디오 스트리밍 지연 및 패킷 손실<br>2. 모바일 브라우저의 마이크 접근 권한 및 HTTPS 필수 요구사항<br>3. Google STT API 연동 및 오디오 포맷(인코딩, 샘플레이트) 매칭 문제 |
| SUCCESS | 모바일에서 발화한 음성이 지연 시간 2초 이내에 PC 웹 화면에 텍스트로 표시됨 |
| SCOPE | **In-scope**: 모바일 웹 클라이언트(마이크 제어/스트리밍), PC 웹 클라이언트(결과 모니터링), Node.js 중계/STT 서버<br>**Out-of-scope**: 네이티브 모바일 앱(웹앱 우선), 다중 채널/다중 사용자 동시 세션 처리(단일 세션 우선) |

---

## 1. Overview

### 1.1 Purpose

모바일 기기의 하드웨어 마이크를 통해 사용자의 음성을 입력받고, 이를 PC(서버)로 실시간 스트리밍하여 Google Cloud STT(Speech-to-Text) API를 통해 텍스트로 변환한 결과를 실시간으로 화면에 표시하는 웹/앱 서비스를 구축합니다.

### 1.2 Background

음성 인식 기반의 입력 방식이 대중화됨에 따라, 모바일 기기를 무선 마이크처럼 활용하여 PC나 서버에서 실시간 텍스트 변환을 수행하는 브릿지 시스템의 필요성이 대두되었습니다.

### 1.3 Related Documents

- Requirements: 없음
- References: Google Cloud Speech-to-Text Node.js Client, Socket.IO WebSockets

---

## 2. Scope

### 2.1 In Scope

- [x] Node.js 기반 WebSocket(또는 Socket.IO) 중계 및 STT 처리 서버 구현
- [x] 모바일 브라우저용 음성 캡처 및 스트리밍 클라이언트 (MediaRecorder API 활용)
- [x] PC 브라우저용 실시간 STT 결과 모니터링 UI
- [x] Google Cloud STT API 연동 (StreamingRecognize)

### 2.2 Out of Scope

- 다중 사용자 세션 분리 (MVP 단계에서는 단일 방/단일 세션 가정)
- 오디오 파일 저장 및 재가공

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 모바일 웹에서 마이크 접근 권한 요청 및 오디오 데이터 캡처 | High | Pending |
| FR-02 | 캡처된 오디오 데이터를 서버로 실시간 스트리밍 (WebSocket) | High | Pending |
| FR-03 | 서버에서 수신한 오디오 스트림을 Google STT API로 전달 | High | Pending |
| FR-04 | STT 변환 결과를 클라이언트(PC)로 브로드캐스트 | High | Pending |
| FR-05 | PC 웹 화면에서 수신된 텍스트를 실시간으로 UI에 렌더링 | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 음성 발화 후 텍스트 표시까지 지연시간 < 2초 | 수동 테스트 및 로그 타임스탬프 비교 |
| Security | 마이크 접근을 위한 HTTPS 환경 구성 (로컬 테스트 시 localhost 또는 ngrok 사용) | 브라우저 보안 경고 확인 |
| Reliability | 네트워크 불안정 시 WebSocket 재연결 처리 | 브라우저 네트워크 탭에서 연결 끊기 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모바일 클라이언트에서 음성 스트리밍 기능 정상 동작
- [ ] 서버에서 Google STT API를 통한 텍스트 변환 정상 동작
- [ ] PC 클라이언트에서 변환된 텍스트 실시간 표시
- [ ] 환경 변수 설정 가이드(Google API Key 등) 작성 완료

### 4.2 Quality Criteria

- [ ] 오디오 인코딩 및 샘플레이트가 Google STT 요구사항과 일치할 것
- [ ] Lint 검사 통과 및 기본 오류 처리(예외 처리) 반영

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Google API 인증 및 요금 | High | Medium | 개발 단계에서는 할당량을 모니터링하고, 가이드 문서에 GCP 인증서(JSON) 설정 방법을 명확히 기재 |
| 모바일 브라우저 마이크 접근 불가 | High | Medium | HTTPS 환경 필수 안내. 로컬 개발 시 ngrok, localtunnel 등을 활용하도록 가이드 |
| 오디오 포맷 불일치로 인한 인식률 저하 | High | High | 클라이언트에서 오디오 캡처 시 Sample Rate 및 Encoding 방식을 서버 STT 설정과 일치시키도록 코드 구현 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | [x] |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Architecture | Monorepo vs Separate Repos | Monorepo | 로컬 개발 환경(`D:\develop\mobile-to-pc-STT`)의 단일 저장소에서 프론트/백엔드 관리가 용이함 |
| Frontend | Next.js / React / Vanilla JS | React(Vite) | 모바일/PC 뷰가 단순하므로 SPA 기반의 Vite-React로 구성하여 빠르고 가볍게 구축 |
| Backend | Node.js(Express) / Python(FastAPI) | Node.js | Socket.IO와 Google 클라이언트 라이브러리 지원이 강력함 |
| Realtime | WebRTC / WebSocket(Socket.IO) | Socket.IO | 오디오 데이터를 단순히 서버로 릴레이하기에는 Socket.IO가 구현이 더 직관적임 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

Folder Structure Preview:
D:\develop\mobile-to-pc-STT\
┌─────────────────────────────────────────────────────┐
│ backend/                                            │
│   src/services/stt.service.js (Google STT 로직)     │
│   src/socket/index.js (WebSocket 이벤트 핸들러)     │
│   server.js                                         │
├─────────────────────────────────────────────────────┤
│ frontend/                                           │
│   src/components/ (MobileMic.jsx, PcDisplay.jsx)    │
│   src/hooks/useAudioRecorder.js                     │
│   src/App.jsx                                       │
└─────────────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [ ] `GEMINI.md` has coding conventions section
- [ ] `docs/01-plan/conventions.md` exists (Phase 2 output)

### 7.2 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `VITE_API_URL` | WebSocket 서버 엔드포인트 | Client | [x] |
| `GOOGLE_APPLICATION_CREDENTIALS` | GCP 서비스 계정 키 파일 경로 | Server | [x] |
| `PORT` | 서버 실행 포트 | Server | [x] |

### 7.3 Pipeline Integration

| Phase | Status | Document Location | Command |
|-------|:------:|-------------------|---------|
| Phase 1 (Schema) | [x] | (본 기획서로 대체/API가 단순함) | |
| Phase 2 (Convention) | Pending | `docs/01-plan/conventions.md` | |

---

## 8. Next Steps

1. [x] Plan 문서 검토 및 확정
2. [ ] Phase 2: 코딩 컨벤션 및 룰 정의 (Conventions)
3. [ ] Phase 3/4: Design 문서 작성 및 시스템 설계 구체화
