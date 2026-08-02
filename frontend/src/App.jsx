import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MobilePage from './pages/MobilePage';
import PcPage from './pages/PcPage';

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <nav style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
          <Link to="/mobile" style={{ marginRight: '15px' }}>Mobile (Mic)</Link>
          <Link to="/pc">PC (Display)</Link>
        </nav>
        <Routes>
          <Route path="/" element={<h2>메뉴를 선택하세요.</h2>} />
          <Route path="/mobile" element={<MobilePage />} />
          <Route path="/pc" element={<PcPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
