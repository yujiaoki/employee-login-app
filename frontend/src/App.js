import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Renderの環境変数からバックエンドのURLを取得。設定がない場合はローカルを参照。
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [items, setItems] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. アイテム一覧を取得する関数
  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/items`);
      setItems(response.data);
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    }
  };

  // 起動時にデータを読み込む
  useEffect(() => {
    fetchItems();
  }, []);

  // 2. アイテムを追加する関数
  const addItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/items`, { title: newItemTitle });
      setNewItemTitle(''); // 入力欄を空にする
      fetchItems();        // リストを更新
    } catch (error) {
      console.error('追加に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  // 3. 「完了（購入済み）」にする関数
  const completeItem = async (id) => {
    try {
      await axios.patch(`${API_URL}/items/${id}`);
      fetchItems(); // リストを更新（購入済みは消える）
    } catch (error) {
      console.error('更新に失敗しました:', error);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>🛒 二人の買い物リスト</h2>

      {/* 入力フォーム */}
      <form onSubmit={addItem} style={{ display: 'flex', marginBottom: '20px' }}>
        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="買うものを入力..."
          style={{ flex: 1, padding: '10px', fontSize: '16px', borderRadius: '4px 0 0 4px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '0 4px 4px 0' }}
        >
          {loading ? '追加中...' : '追加'}
        </button>
      </form>

      {/* リスト表示 */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>買うものはありません ✨</p>
        ) : (
          items.map((item) => (
            <li key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '12px', 
              borderBottom: '1px solid #eee',
              backgroundColor: '#fff'
            }}>
              <span style={{ fontSize: '18px' }}>{item.title}</span>
              <button
                onClick={() => completeItem(item.id)}
                style={{ padding: '5px 12px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                完了
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;