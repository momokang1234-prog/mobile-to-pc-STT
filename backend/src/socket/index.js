function setupSocketHandlers(io, keyboardSimulator) {
  io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id);

    // 연결 시 현재 입력 상태 전송
    socket.emit('input_status', {
      enabled: keyboardSimulator.isEnabled()
    });

    /**
     * 음성 텍스트 변경점 수신 → 키보드 시뮬레이션
     * data: { deleteCount: number, typeText: string }
     */
    socket.on('speech_diff', (data) => {
      const { deleteCount, typeText } = data;

      if (deleteCount > 0) {
        if (typeText) {
          keyboardSimulator.replaceInterim(deleteCount, typeText);
        } else {
          keyboardSimulator.deleteChars(deleteCount);
        }
        console.log(`[STT] DIFF: Deleted ${deleteCount}, Typed "${typeText}"`);
      } else if (typeText) {
        keyboardSimulator.typeText(typeText);
        console.log(`[STT] DIFF: Appended "${typeText}"`);
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
