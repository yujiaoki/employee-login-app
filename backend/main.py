from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import os

app = FastAPI()

# フロントエンドからのアクセスを許可する設定 (CORS)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db_conn():
    return psycopg2.connect(os.environ.get("DATABASE_URL"))

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