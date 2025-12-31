import os
from datetime import datetime
from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel

# 1. データベース設定
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. モデル定義（テーブルの設計図）
class ShoppingItem(Base):
    __tablename__ = "shopping_items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    is_bought = Column(Boolean, default=False)  # 購入済みならTrue
    created_at = Column(DateTime, default=datetime.now)

# テーブルの作成
Base.metadata.create_all(bind=engine)

# 3. FastAPIの初期化
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DBセッション管理
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4. Pydanticモデル（データのやり取り用）
class ItemCreate(BaseModel):
    title: str

class ItemResponse(BaseModel):
    id: int
    title: str
    is_bought: bool
    created_at: datetime
    class Config:
        from_attributes = True

# 5. APIエンドポイント（機能）

# アイテム一覧を取得（未購入のみ）
@app.get("/items", response_model=List[ItemResponse])
def read_items(db: Session = Depends(get_db)):
    return db.query(ShoppingItem).filter(ShoppingItem.is_bought == False).order_by(ShoppingItem.created_at.desc()).all()

# アイテムを追加
@app.post("/items", response_model=ItemResponse)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    db_item = ShoppingItem(title=item.title)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# 購入済みに更新（完了ボタン用）
@app.patch("/items/{item_id}", response_model=ItemResponse)
def buy_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db_item.is_bought = True
    db.commit()
    db.refresh(db_item)
    return db_item

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)