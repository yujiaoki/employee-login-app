from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import os

app = FastAPI()

# --- CORSの設定を追加 ---
# これを入れないと、ブラウザが「知らないURL（Renderのフロント）からの通信」を拒否します
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 本番ではフロントのURLに絞るのが理想ですが、まずは"*"で全て許可
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_conn():
    # Renderのデータベース設定画面で取得できるURLを環境変数から読み込むようにします
    # なければローカルのDBに繋ぎます
    database_url = os.environ.get("DATABASE_URL", "postgresql://user:password@db:5432/app_db")
    return psycopg2.connect(database_url)

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.post("/login/{emp_id}")
def login(emp_id: str):
    conn = get_db_conn()
    cur = conn.cursor()
    # テーブルがなければ作成、あれば回数を+1（競プロ的な更新処理）
    cur.execute("CREATE TABLE IF NOT EXISTS logins (id TEXT PRIMARY KEY, count INTEGER);")
    cur.execute("INSERT INTO logins (id, count) VALUES (%s, 1) ON CONFLICT (id) DO UPDATE SET count = logins.count + 1;", (emp_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": f"{emp_id} logged in!"}

@app.get("/stats")
def get_stats():
    conn = get_db_conn()
    cur = conn.cursor()
    # テーブルがなければ作成（念のため）
    cur.execute("CREATE TABLE IF NOT EXISTS logins (id TEXT PRIMARY KEY, count INTEGER);")
    
    # ログイン回数が多い順（DESC）に全件取得
    cur.execute("SELECT id, count FROM logins ORDER BY count DESC;")
    rows = cur.fetchall()
    
    cur.close()
    conn.close()
    
    # フロントエンドが扱いやすい「辞書のリスト」形式で返す
    return [{"id": row[0], "count": row[1]} for row in rows]

if __name__ == "__main__":
    import uvicorn
    # Renderはポート番号を環境変数 PORT で指定してくるため、それに合わせます
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)