# Mobile STT Client Design Document

> Version: 1.0.0 | Created: 2026-08-01 | Status: Draft

## Context Anchor
| Dimension | Content |
|-----------|---------|
| WHY | 기존 웹 기반 STT의 한계를 극복하고, 네이티브 모바일 마이크 하드웨어를 직접 제어하여 음성 인식 품질과 안정성을 높이기 위함 |
| WHO | 모바일 기기를 통해 PC/서버로 실시간 음성 인식을 전송하고자 하는 사용자 |
| RISK | 1. `@react-native-voice/voice` 네이티브 모듈 연동(Expo Prebuild 필요), 2. Socket.io 실시간 통신 시 네트워크 단절 처리, 3. 안드로이드 마이크 권한 처리 |
| SUCCESS | 안드로이드 앱에서 마이크 권한을 획득하고, 실시간 음성 인식 텍스트를 Socket.io(포트 5000) 백엔드로 지연 없이 스트리밍 전송 성공 |
| SCOPE | IN: 안드로이드 Expo 기반 네이티브 STT 앱 구현, Socket.io 통신 / OUT: iOS 지원(초기 릴리즈 제외), 백엔드 서버 로직 수정 |

## 1. Overview
이 문서는 Expo와 React Native를 사용하여 안드로이드 모바일 기기에서 실시간 음성을 텍스트로 변환하고, 기존 Socket.io 백엔드로 스트리밍하는 STT 클라이언트 앱의 기술 설계서입니다.

## 2. Architecture
### 2.1. System Diagram
- **App (Frontend)**: Expo 앱 모듈
  - **Voice Module**: `@react-native-voice/voice` (마이크 녹음 및 네이티브 STT 변환)
  - **Socket Client**: `socket.io-client` (5000 포트의 기존 백엔드와 양방향 통신)
- **Backend**: Socket.io Server (port: 5000)

### 2.2. Components
- **Main Screen (App.tsx)**: 마이크 권한 관리, 녹음 시작/중지 UI, 상태 인디케이터.
- **Voice Handler**: 네이티브 STT 엔진으로부터 이벤트(onSpeechStart, onSpeechRecognized, onSpeechResults) 수신.
- **Socket Manager**: 백엔드 연결 유지 및 텍스트 데이터(`stt_data`) 실시간 발행.

## 3. Data Model
### Socket Emit Event (App -> Backend)
```typescript
interface STTDataPayload {
  text: string;      // 인식된 텍스트
  isFinal: boolean;  // 최종 결과 여부 
}
// socket.emit('stt_data', payload)
```

## 4. API Specification
- **WebSocket (Socket.io)**
  - `URL`: `http://<백엔드_IP>:5000` (로컬 테스트 시 10.0.2.2 등)
  - `Emit`: 음성 텍스트 데이터 전송 (`stt_data` 이벤트)

## 5. UI Design
- 상단: 앱 타이틀 및 네트워크 연결 상태 인디케이터.
- 중앙: 실시간 인식 텍스트 (완료 텍스트는 굵게, 중간 결과는 이탤릭체).
- 하단: 커다란 원형 토글 마이크 버튼.
