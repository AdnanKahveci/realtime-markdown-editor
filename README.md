# 📝 Real-Time Markdown Editor  

---

## 🌟 Öne Çıkan Özellikler  
1. **Gerçek Zamanlı İşbirliği**  
   - Aynı doküman üzerinde birden fazla kullanıcı anlık olarak düzenleme yapabilir (Google Docs benzeri).  
2. **Markdown Önizleme Paneli**  
   - Sağ tarafta yazılan Markdown'ın HTML çıktısı anlık görüntülenir.  
3. **Özel Odalar**  
   - `/room/<unique-id>` ile özel çalışma odaları oluşturulabilir.  
4. **Basit Kimlik Doğrulama**  
   - Kullanıcılar isimlerini girerek odaya katılır (JWT veya localStorage ile session yönetimi).  

---

## 🛠️ Teknoloji Stack'i  
| **Frontend**       | **Backend**         | **Veritabanı**     |  
|--------------------|---------------------|--------------------|  
| React + TypeScript | Node.js (Express)   | SQLite (Basit DB)  |  
| Socket.io-Client   | Socket.io           | Redis (Oda Yönetimi)|  
| marked.js          | JWT                 |                    |  

---

## 🚀 Kurulum  
### Gereksinimler  
- Node.js ≥ v18.x  
- npm ≥ v9.x  

### Adımlar  
1. **Repoyu Klonla:**  
   ```bash
   git clone https://github.com/AdnanKahveci/realtime-markdown-editor.git
   cd realtime-markdown-editor
   ```

2. **Backend Kurulumu:**
   ```bash
    cd backend
    npm install
    cp .env.example .env  # PORT ve CORS_ORIGIN'i ayarla
   ```
3. **Frontend Kurulumu:**
   ```bash
   cd ../frontend
   npm install
   ```
4. **Uygulamayı Başlat:**

   **Backend:**
   ```bash
   cd backend && node server.js  # http://localhost:4000
   ```
   **Frontend:**
   ```bash
   cd frontend && npm run dev  # http://localhost:3000
   ```

---

## 📂 Proje Mimarisi

```plaintext
┌───────────────┐          ┌───────────────┐
│   Frontend    │  Socket  │    Backend    │
│  (React App)  │ ↔ io ↔   │  (Node.js)    │
└───────┬───────┘          └───────┬───────┘
        │                          │
        │  Markdown → HTML         │  ┌──────────────────┐
        │                          │  │ SQLite           │
┌───────┴───────┐                  │  │ - Doküman Vers.  │
│   Kullanıcı   │                  │  └──────────────────┘
└───────────────┘                  │
                                   │  ┌──────────────────┐
                                   │  │ Redis            │
                                   │  │ - Oda Yönetimi   │
                                   │  │ - Kullanıcı Sync │
                                   │  └──────────────────┘

```
---

# 🖼️ Ekran Görüntüleri
...
