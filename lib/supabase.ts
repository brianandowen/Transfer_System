// ✅ 從 @supabase/supabase-js 套件中引入 createClient 函式，用來初始化 Supabase 客戶端
import { createClient } from '@supabase/supabase-js';

// ✅ Supabase 專案的 URL（來自 .env 檔），必須設為公開用環境變數
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!; 
// ‼️ 開頭為 NEXT_PUBLIC 代表這個變數也會在前端程式中被暴露（是公開的）
// ✅ 注意：這是可安全公開的專案端點（與前端使用 supabase.createClient 時相同）

// ✅ Supabase Service Role 金鑰（來自 .env 檔），僅限後端使用
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// ‼️ 這是「後端服務權限金鑰」，具備完整 CRUD 權限，**只能用在伺服器端**
// ‼️ 絕對不能暴露給瀏覽器端，否則會造成嚴重資安風險

// ✅ 建立 Supabase 客戶端，供所有後端 API 使用（如 /api/* 中的資料操作）
export const supabase = createClient(supabaseUrl, supabaseKey);
// 🧠 createClient 會回傳一個可執行資料表操作、驗證、存取 bucket 的物件
