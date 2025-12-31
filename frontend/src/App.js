import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [items, setItems] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/items`);
      setItems(response.data);
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/items`, { title: newItemTitle });
      setNewItemTitle('');
      fetchItems();
    } catch (error) {
      console.error('追加に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeItem = async (id) => {
    try {
      await axios.patch(`${API_URL}/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error('更新に失敗しました:', error);
    }
  };

  // ...（上のインポート部分は同じ）

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FFF9E3', 
      padding: '20px',
      fontFamily: 'sans-serif',
      color: '#5D4037'
    }}>
      <div style={{ 
        maxWidth: '500px', 
        margin: '0 auto', 
        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
        padding: '20px', 
        borderRadius: '30px', 
        border: '3px solid #D7CCC8'
      }}>
        
        {/* ★ 画像を表示するセクション ★ */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <img 
            src="/chairoikoguma.png"  // publicフォルダに入れたファイル名
            alt="チャイロイコグマ" 
            style={{ width: '120px', height: 'auto', borderRadius: '10px' }} 
          />
          <h1 style={{ fontSize: '22px', margin: '10px 0', color: '#8D6E63' }}>
            🐻 裕嗣＆菜奈子の買い物リスト 🍯
          </h1>
        </div>

        {/* 入力フォーム（以下、先ほどと同じ） */}
        <form onSubmit={addItem} style={{ display: 'flex', marginBottom: '20px', gap: '8px' }}>
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="なにを買う？"
            style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '2px solid #D7CCC8' }}
          />
          <button
            type="submit"
            style={{ padding: '10px 20px', backgroundColor: '#8D6E63', color: 'white', borderRadius: '20px', border: 'none', fontWeight: 'bold' }}
          >
            追加
          </button>
        </form>

        {/* リスト表示（以下、先ほどと同じ） */}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map((item) => (
            <li key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '15px', 
              marginBottom: '10px',
              backgroundColor: '#fff',
              borderRadius: '15px'
            }}>
              <span>🐾 {item.title}</span>
              <button
                onClick={() => completeItem(item.id)}
                style={{ backgroundColor: '#FFECB3', border: 'none', borderRadius: '10px', padding: '5px 10px', fontWeight: 'bold' }}
              >
                買った！
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;