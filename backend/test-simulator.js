const KeyboardSimulator = require('./src/services/keyboardSimulator');

async function runTest() {
    console.log('Initializing KeyboardSimulator...');
    const simulator = new KeyboardSimulator();
    
    // Wait for the initialization (compilation of KeySim.exe)
    // The constructor is synchronous but kicks off async tasks. 
    // To be safe, wait a second.
    await new Promise(r => setTimeout(r, 2000));

    console.log('Typing: 테스트 성공');
    await simulator.commitFinal("테스트 성공");
    
    console.log('Done.');
}

runTest().catch(console.error);
