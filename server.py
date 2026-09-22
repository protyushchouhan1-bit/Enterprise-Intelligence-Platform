from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import pandas as pd
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join("data", "enterprise_intelligence.db")
if not os.path.exists(DB_PATH):
    DB_PATH = "enterprise_intelligence.db"

@app.get("/api/dashboard-data")
def get_dashboard_data():
    conn = sqlite3.connect(DB_PATH)
    try:
        df = pd.read_sql_query("SELECT * FROM vw_daily_sales_performance", conn)
    except Exception:
        try:
            df = pd.read_sql_query("SELECT * FROM fact_daily_sales", conn)
        except Exception:
            return []
    conn.close()

    df['sale_date'] = pd.to_datetime(df['sale_date']).dt.strftime('%Y-%m-%d')
    df['day_name'] = pd.to_datetime(df['sale_date']).dt.day_name()
    return df.to_dict(orient="records")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
