# 🎓 Transfer_System｜輔仁大學學生轉系資訊整合系統

本系統是一個整合性平台，專為輔仁大學大學生設計，提供全校轉系資訊查詢、轉系條件整理、MBTI人格測驗推薦，以及後台管理介面等功能。  
目的在於協助學生快速找到適合自己的科系，並簡化轉系相關資訊的獲取流程。

---

## 🧱 技術架構

| 類別     | 技術                         |
|----------|------------------------------|
| 前端     | Next.js 14 + Tailwind CSS    |
| 資料庫   | Supabase（PostgreSQL）       |
| 部署平台 | Vercel                        |
| 驗證機制 | Cookie-based Admin Login     |
| 狀態管理 | React Hooks                  |

---

## 🔍 系統功能

### ✅ 學生端功能
- 系所資訊快速查詢（依學群分類與關鍵字搜尋）
- 點擊卡片查看詳細轉系條件（考試科目、成績比例、備註、名額）
- MBTI 測驗推薦適合與不適合的系所（以卡片呈現並可點擊跳轉）

### 🔐 管理者端功能
- 登入驗證（使用 Cookie 儲存登入狀態）
- 新增、編輯、刪除系所資料
- 設定轉系條件（考試科目、成績比例、備註）
- 設定 MBTI 對應關係（適合/不適合系所）
- 管理各年級名額（Grade Quotas）

---

## 📁 專案結構

```
Transfer_System/
├── app/ # 所有頁面（包含主站與後台）
│ ├── (main)/ # 使用者端功能（查詢、MBTI 等）
│ ├── (admin)/admin/ # 管理端介面（需登入）
│ └── login/ # 登入頁面
├── components/ # 共用元件（卡片、欄位等）
├── lib/ # Supabase 初始化、cookie 工具等
├── public/ # 靜態資源
├── styles/ # Tailwind + 自訂 CSS
└── README.md
```
---

## ⚙️ 環境變數設定 `.env.local`

請依照以下格式建立 `.env.local` 檔案，並填入你自己的 Supabase 專案資訊：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
---

## 🚀 快速啟動指南

# 1. 下載專案
git clone https://github.com/brianandowen/Transfer_System.git
cd Transfer_System

# 2. 安裝依賴
npm install

# 3. 建立環境變數檔
touch .env.local
並填入對應的 Supabase 資訊

# 4. 啟動開發伺服器
npm run dev

---

## 🧪 測試帳號（若有提供）

```txt
帳號：admin
密碼：admin123
```
---

## 🗃️ 資料庫結構設計（Supabase）

本系統使用 Supabase 作為後端資料庫，主要為 PostgreSQL 架構。共設計以下 5 張核心資料表，分別對應前台查詢、MBTI 推薦與後台管理功能。

### 🔸 1. `departments`｜系所資料表

| 欄位名稱         | 型態       | 說明                         |
|------------------|------------|------------------------------|
| `department_id`  | integer    | 主鍵，系所 ID，自動遞增      |
| `department_name`| varchar    | 系所名稱（如中文系）         |
| `category`       | varchar    | 所屬學群（如文史哲學群）     |

---

### 🔸 2. `transfer_conditions`｜轉系條件表

| 欄位名稱         | 型態       | 說明                                   |
|------------------|------------|----------------------------------------|
| `condition_id`   | integer    | 主鍵，自動遞增                         |
| `department_id`  | integer    | 外鍵，對應 `departments` 表的 ID      |
| `exam_type`      | varchar    | 考試類型（如口試、書面審查）           |
| `score_ratio`    | json       | 各項目成績比例，例如 `{ "口試": 100 }` |
| `remarks`        | text       | 備註說明                               |

> 💡 更新轉系條件採「先刪除再插入」方式，確保 UNIQUE 約束不衝突。

---

### 🔸 3. `grade_quotas`｜年級名額表

| 欄位名稱         | 型態       | 說明                         |
|------------------|------------|------------------------------|
| `quota_id`       | integer    | 主鍵，自動產生               |
| `department_id`  | integer    | 外鍵，對應系所               |
| `grade`          | integer    | 年級（例如 2 表示二年級）    |
| `quota`          | integer    | 該年級可轉入名額             |

---

### 🔸 4. `mbti_recommendations`｜MBTI 推薦對應表

| 欄位名稱         | 型態       | 說明                                 |
|------------------|------------|--------------------------------------|
| `mbti_type`      | varchar    | MBTI 類型（如 ENFP）                |
| `suitable_ids`   | integer[]  | 適合系所 ID 陣列（FK: departments）  |
| `unsuitable_ids` | integer[]  | 不適合系所 ID 陣列                   |

---

### 🔸 5. `admin_users`｜管理員帳號表

| 欄位名稱    | 型態     | 說明                |
|-------------|----------|---------------------|
| `id`        | integer  | 主鍵                |
| `username`  | varchar  | 管理員帳號名稱      |
| `password`  | varchar  | 管理員密碼（明碼或加密） |

---

### 🔐 驗證與存取機制

- 管理員登入 API：`/api/login`，驗證成功後設置 cookie
- 後台頁面（如 `/admin`）透過伺服端 `cookies().get()` 驗證登入狀態
- 一旦未驗證，將自動導向 `/login` 頁面

---

### 📊 前端功能與資料表對應關係

| 前端功能               | 使用資料表                                  |
|------------------------|----------------------------------------------|
| 系所查詢與條件瀏覽     | `departments`、`grade_quotas`、`transfer_conditions` |
| MBTI 測驗推薦系所       | `mbti_recommendations`、`departments`         |
| 後台 CRUD 編輯         | 所有資料表                                   |
| 管理員登入驗證         | `admin_users`                                 |

---

## 🙋‍♂️ 專案開發者

本系統由陳庭毅（Chen Ting-Yi）獨立開發完成。  
GitHub 帳號：[brianandowen](https://github.com/brianandowen)  
學校：輔仁大學 資訊管理學系  
專題名稱：輔仁大學轉系資訊整合系統（Transfer_System）

如有合作開發、展示需求，歡迎聯絡。
Mail: brianandowen [at] gmail [dot] com
