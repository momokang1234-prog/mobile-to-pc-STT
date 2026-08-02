@echo off
start "STT Mobile App (Expo)" cmd /k "cd /d D:\develop\mobile-to-pc-STT\mobile-app && npm start"
start "STT Backend (Keyboard Injector)" cmd /k "cd /d D:\develop\mobile-to-pc-STT\backend && npm start"
start "STT Web Frontend (Vite SSL)" cmd /k "cd /d D:\develop\mobile-to-pc-STT\frontend && npm run dev"
