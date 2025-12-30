import React, { useState } from 'react';

function App() {
  const [empId, setEmpId] = useState('');
  const login = () => {
    fetch(`http://localhost:8000/login/${empId}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => alert(data.message));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>従業員ログイン管理</h1>
      <input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="従業員ID" />
      <button onClick={login}>ログイン!</button>
    </div>
  );
}
export default App;