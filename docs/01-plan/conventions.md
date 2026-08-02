# mobile-to-pc-STT Coding Conventions

> PDCA Convention Document - 코드 작성 규칙 정의

**Version**: 1.0
**Created**: 2026-08-01
**Level**: Dynamic

---

## 1. Naming Conventions

### Files & Folders
| Target | Rule | Example |
|--------|------|---------|
| Frontend Component files | PascalCase | `MobileMic.jsx` |
| Frontend Utility files | camelCase | `audioUtils.js` |
| Backend files | camelCase / kebab-case | `sttService.js`, `socket-handler.js` |
| Folders | kebab-case | `mobile-client/`, `stt-server/` |
| Constants | UPPER_SNAKE_CASE | `API_ENDPOINTS.js` |

### Code
| Target | Rule | Example |
|--------|------|---------|
| React Components | PascalCase | `TranscriptDisplay` |
| Functions | camelCase | `startRecording()` |
| Variables | camelCase | `audioStream` |
| Constants | UPPER_SNAKE_CASE | `SOCKET_PORT` |

---

## 2. Folder Structure (Monorepo)

```
D:\develop\mobile-to-pc-STT\
├── backend/             # Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── services/    # Google STT 등 비즈니스 로직
│   │   ├── socket/      # 웹소켓 이벤트 핸들러
│   │   └── utils/       # 공통 유틸
│   └── server.js
├── frontend/            # React (Vite)
│   ├── src/
│   │   ├── components/  # 공통 및 화면별 UI 컴포넌트
│   │   ├── hooks/       # Custom hooks (마이크 제어 등)
│   │   ├── pages/       # Mobile, PC 페이지 분리
│   │   └── App.jsx
│   └── index.html
```

---

## 3. Import Order (Frontend)

```javascript
// 1. External libraries
import React, { useState } from 'react'
import { io } from 'socket.io-client'

// 2. Internal absolute / aliases (if configured)
import { startSTT } from '@/services/api'

// 3. Relative imports
import useAudioRecorder from '../hooks/useAudioRecorder'

// 4. Styles
import './App.css'
```

---

## 4. Environment Variables

### Naming Convention & Required Files
| Location | Prefix | Scope | Example | File |
|----------|-------|-------|---------|------|
| Frontend | `VITE_` | Client-side | `VITE_SOCKET_URL` | `frontend/.env` |
| Backend | None | Server-side | `GOOGLE_APPLICATION_CREDENTIALS` | `backend/.env` |

---

## 5. Code Style

- Indentation: 2 spaces
- Quotes: Single quotes (') for JS/JSX
- Semicolons: None (또는 Prettier 설정 따름)
- Max line length: 100

---

## Validation Checklist

- [x] Naming convention 정의됨
- [x] Folder structure 정의됨
- [x] Import order 정의됨
- [x] Environment variables 정의됨
- [x] Code style 설정됨
