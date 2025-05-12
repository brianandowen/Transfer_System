// src/lib/db.ts
import mysql from 'mysql2/promise';

// 創建一個資料庫連線
export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transfer_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
