# Mobile STT Client Plan Document

> Version: 1.0.0 | Created: 2026-08-01 | Status: Draft

## Context Anchor
| Dimension | Content |
|-----------|---------|
| WHY | 기존 웹 기반 STT의 한계를 극복하고, 네이티브 모바일 마이크 하드웨어를 직접 제어하여 음성 인식 품질과 안정성을 높이기 위함 |
| WHO | 모바일 기기를 통해 PC/서버로 실시간 음성 인식을 전송하고자 하는 사용자 |
| RISK | 1. `@react-native-voice/voice` 네이티브 모듈 연동(Expo Prebuild 필요), 2. Socket.io 실시간 통신 시 네트워크 단절 처리, 3. 안드로이드 마이크 권한 처리 |
| SUCCESS | 안드로이드 앱에서 마이크 권한을 획득하고, 실시간 음성 인식 텍스트를 Socket.io(포트 5000) 백엔드로 지연 없이 스트리밍 전송 성공 |
| SCOPE | IN: 안드로이드 Expo 기반 네이티브 STT 앱 구현, Socket.io 통신 / OUT: iOS 지원(초기 릴리즈 제외), 백엔드 서버 로직 수정 |

## 1. Executive Summary
현재 웹 기반으로 동작하는 STT(음성 인식) 클라이언트를 React Native(Expo)를 활용하여 안드로이드 네이티브 앱으로 재작성합니다. 네이티브 마이크 하드웨어를 제어하여 인식률과 안정성을 높이며, 인식된 텍스트는 기존 Socket.io(포트 5000) 백엔드로 실시간 스트리밍됩니다.

## 2. Goals and Objectives
- 모바일(Android) 전용 네이티브 앱으로 STT 클라이언트 전환
- 네이티브 STT 라이브러리(`@react-native-voice/voice` 등) 연동을 통한 성능 향상
- 기존 백엔드 인프라(Socket.io)와의 100% 호환성 유지

## 3. Scope
### In Scope
- Expo 기반 프로젝트 설정 (`mobile-app` 디렉토리)
- Android 마이크 권한 요청 및 상태 관리 UI
- STT 네이티브 모듈 연동 및 음성 인식 로직 구현
- Socket.io-client를 통한 백엔드(포트 5000) 실시간 텍스트 전송
- 기본적인 시작/중지 및 상태 표시 UI

### Out of Scope
- iOS 및 데스크톱 앱 빌드
- STT 백엔드(서버 측) 로직 추가 및 수정
- 복잡한 사용자 인증 및 데이터베이스 연동

## 4. Success Criteria
| Criterion | Metric | Target |
|-----------|--------|--------|
| 마이크 권한 획득 | 권한 요청 성공률 | 100% |
| STT 인식률 | 음성 입력 시 텍스트 변환 소요 시간 | < 500ms |
| Socket.io 전송 | 백엔드 수신 지연(Latency) | < 100ms |

## 5. Timeline
| Milestone | Date | Description |
|-----------|------|-------------|
| Phase 1: Plan | 2026-08-01 | 요구사항 정의 및 Plan 문서 작성 (완료) |
| Phase 2: Design | TBD | UI/UX 및 아키텍처, 네이티브 모듈 설계 |
| Phase 3: Do | TBD | Expo 초기화, STT 모듈 및 Socket 통신 구현 |
| Phase 4: Check | TBD | Android 에뮬레이터/실기기 연동 테스트 및 QA |
| Phase 5: Act/Report| TBD | 버그 수정 및 최종 결과 보고 |

## 6. Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Expo Go 호환성 문제 | High | `@react-native-voice/voice`는 네이티브 모듈이므로 Expo Go 대신 `npx expo run:android` (Dev Client)를 사용하여 테스트 |
| 백그라운드 STT 제약 | Medium | 안드로이드 백그라운드 제약 고려, 초기 버전은 앱이 켜져 있는 포그라운드 상태를 기준으로 개발 |
| Socket.io 연결 끊김 | Medium | 자동 재연결 로직 구현 및 연결 상태(연결됨/끊어짐) 표시 UI 추가 |
