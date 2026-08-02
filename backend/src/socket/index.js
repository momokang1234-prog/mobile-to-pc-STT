function setupSocketHandlers(io, keyboardSimulator) {
  io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id);

    // 연결 시 현재 입력 상태 전송
    socket.emit('input_status', {
      enabled: keyboardSimulator.isEnabled()
    });

    /**
     * 음성 텍스트 수신 → 키보드 시뮬레이션
     * data: { text: string, isFinal: boolean }
     */
    socket.on('speech_text', (data) => {
      const { text, isFinal } = data;

      if (!text) return;

      // 사용자의 요청에 따라 지우는 로직(backspace)을 제거하고, 
      // 완결된 텍스트(isFinal: true)만 그대로 주입합니다.
      if (isFinal) {
        keyboardSimulator.typeText(text + ' ');
        console.log(`[STT] FINAL TYPED: "${text}"`);
      }
    });

    /**
     * 입력 ON/OFF 토글
     * data: { enabled: boolean }
     */
    socket.on('toggle_input', (data) => {
      keyboardSimulator.setEnabled(data.enabled);
      io.emit('input_status', { enabled: data.enabled });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Client disconnected:', socket.id);
    });
  });
}

module.exports = setupSocketHandlers;

module.exports = setupSocketHandlers;
