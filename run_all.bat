@echo off
start "STT Backend" cmd.exe /k "cd /d D:\develop\mobile-to-pc-STT\backend && npm start"
start "Cloudflare Tunnel" cmd.exe /k "cd /d D:\develop\mobile-to-pc-STT && npx -y cloudflared tunnel --url http://localhost:5000"
