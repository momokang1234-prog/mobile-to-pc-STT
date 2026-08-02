---
template: design
version: 1.2
description: PDCA Design phase document
variables:
  - feature: stt-streaming
  - date: 2026-08-01
  - author: bkit Master Agent
  - project: mobile-to-pc-STT
  - version: 1.0.0
---

# stt-streaming Design Document

> **Summary**: 모바일 기기의 음성을 실시간 스트리밍하여 PC에서 Google STT 텍스트 변환 결과 표시
> **Status**: Draft
> **Planning Doc**: [stt-streaming.plan.md](../../01-plan/features/stt-streaming.plan.md)

---

## 1. Overview

### 1.1 Design Goals
- 모바일 환경에서의 안정적인 마이크 캡처 및 스트리밍 전송
- Google Cloud STT의 Streaming API와 Socket.IO 간의 브릿지 구축
- PC 환경에서의 실시간 텍스트 렌더링 지연 최소화

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────┐       ┌────────────────────┐       ┌──────────────────┐
│  Mobile Client  │       │   Node.js Server   │       │    PC Client     │
│ (Vite + React)  │       │ (Express+Socket.IO)│       │  (Vite + React)  │
│                 │       │                    │       │                  │
│ [MediaRecorder] │ ──1──▶│ [Socket.IO Server] │───3──▶│ [Text Display]   │
│                 │ audio │         │          │ text  │                  │
└─────────────────┘       └─────────┼──────────┘       └──────────────────┘
                                    │2 (gRPC)
                                    ▼
                          ┌────────────────────┐
                          │  Google Cloud STT  │
                          │ (StreamingRecognize)│
                          └────────────────────┘
```

### 2.2 Data Flow
1. 모바일에서 마이크 스트림 획득 후 `MediaRecorder`로 일정 간격(예: 250ms)마다 오디오 청크 추출
2. Socket.IO를 통해 서버로 전송 (`audio_data` 이벤트)
3. 서버에서 수신한 바이너리 데이터를 `@google-cloud/speech` 스트림에 Write
4. STT API에서 텍스트 결과(부분/최종)를 반환하면 Socket.IO로 클라이언트 브로드캐스트 (`stt_result` 이벤트)
5. PC 화면에서 수신된 텍스트 렌더링

---

## 3. Data Model / API (WebSocket Events)

### 3.1 Client -> Server Events

| Event Name | Payload | Description |
|------------|---------|-------------|
| `start_recording` | `{ sampleRate: number }` | STT 스트림 초기화 및 시작 |
| `audio_data` | `ArrayBuffer` | 실제 오디오 바이너리 데이터 청크 |
| `stop_recording` | `null` | STT 스트림 종료 |

### 3.2 Server -> Client Events

| Event Name | Payload | Description |
|------------|---------|-------------|
| `stt_result` | `{ text: string, isFinal: boolean }` | 인식된 텍스트 및 문장 완성 여부 |
| `server_error` | `{ message: string }` | 서버 에러 메세지 전달 |

---

## 4. Implementation Guide & Setup

### 4.1 Frontend (React)
- **모듈 분리**: 모바일용 페이지(`/mobile`)와 PC용 페이지(`/pc`)를 라우팅 분리.
- **Audio Capture**: 
  - `navigator.mediaDevices.getUserMedia`를 통해 마이크 권한 획득.
  - `MediaRecorder` API 사용 시 옵션: `mimeType: 'audio/webm;codecs=opus'`.
- **UI**: 모바일은 커다란 '녹음/중지' 토글 버튼. PC는 실시간 결과(isFinal)와 임시 결과(!isFinal)를 시각적으로 분리 렌더링.

### 4.2 Backend (Node.js)
- **Google STT Client**: 
  - 인증: `GOOGLE_APPLICATION_CREDENTIALS` 환경 변수 사용.
  - 스트림 설정: 
    ```javascript
    const request = {
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000, // 모바일 브라우저의 기본 샘플레이트에 맞춰 동적 조정 필요
        languageCode: 'ko-KR',
      },
      interimResults: true, // 실시간 중간 결과 수신
    };
    ```

---

## 5. Security & Deployment

- 로컬 테스트 시 모바일 디바이스에서 마이크에 접근하려면 HTTPS 필수.
- 이를 위해 `ngrok` 혹은 `localtunnel` 등을 통해 로컬 서버를 HTTPS로 외부 포워딩 권장.
