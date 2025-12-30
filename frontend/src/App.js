import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function App() {
  const [empId, setEmpId] = useState('');
  const [stats, setStats] = useState([]); // DBから取得したデータを格納する変数

  // 【関数A】最新の統計データをバックエンドから取ってくる処理
  // fetch の部分を書き換え
  const fetchStats = () => {
    fetch(`${API_URL}/stats`) // localhost ではなく API_URL を使う
      .then(res => res.json())
      .then(data => setStats(data));
  };

  // 画面が最初に表示された時に一度だけ実行
  useEffect(() => {
    fetchStats();
  }, []);

  // 【関数B】ログインボタンを押した時の処理

  const handleLogin = () => {
    if (!empId) return;
    fetch(`${API_URL}/login/${empId}`, { method: 'POST' }) // ここも
      .then(res => res.json())
      .then(() => {
        setEmpId('');
        fetchStats();
      });
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>従業員ログイン管理システム</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          value={empId} 
          onChange={(e) => setEmpId(e.target.value)} 
          placeholder="従業員IDを入力 (例: EMP001)" 
          style={{ padding: '10px', marginRight: '10px' }}
        />
        <button onClick={handleLogin} style={{ padding: '10px 20px' }}>
          ログイン!
        </button>
      </div>

      <h2>ログイン回数ランキング</h2>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#eee' }}>
            <th>従業員ID</th>
            <th>回数</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(row => (
            <tr key={row.id}>
              <td style={{ padding: '10px' }}>{row.id}</td>
              <td style={{ padding: '10px' }}>{row.count} 回</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;