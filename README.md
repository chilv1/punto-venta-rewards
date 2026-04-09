# Programa Punto de Venta

Ung dung web/PWA toi uu cho Android de diem ban:

1. Dang nhap bang ma code va mat khau.
2. Xem ket qua hang ngay theo 4 loai thue bao:
   - Thue bao tra truoc New Line
   - Thue bao tra truoc Portabilidad
   - Thue bao tra sau New Line
   - Thue bao tra sau Portabilidad
3. Xem luỹ ke den ngay tu dong tinh tu sheet `DailyResults`.
4. Theo doi chi tieu tung loai thue bao bang progress bar.
5. Theo doi cac muc chi tieu dong: moi muc co chi tieu rieng cho ca 4 loai thue bao.
6. Diem ban chi dat mot muc khi dat du tung chi tieu con cua muc do.
7. Muon them muc moi trong tuong lai, chi can them 1 dong moi trong sheet `LevelTargets`.
8. Co `Tong so tien thuong` trong thang = tien thuong cua muc cao nhat da dat + tong tien thuong cua cac loai thue bao da dat chi tieu.
9. Giao dien mac dinh la tieng Tay Ban Nha cho nguoi dung Peru, va co the chuyen qua lai giua `ES` va `VI`.

## Chay ung dung

Yeu cau: Node.js 18+

```bash
npm install
cp .env.example .env
npm run dev
```

Mo trinh duyet tai `http://localhost:3000`.

## Deploy len VPS bang Docker + Traefik

Project da co san:

- [Dockerfile](Dockerfile)
- [docker-compose.yml](docker-compose.yml)

Phu hop voi VPS dang chay Traefik va domain `pdv.bitelbot.com`.

1. Clone code len VPS:

```bash
cd /var/www
git clone git@github.com:username/punto-venta-rewards.git
cd punto-venta-rewards
```

2. Tao file `.env`:

```bash
cp .env.example .env
nano .env
```

3. Chay app:

```bash
docker compose up -d --build
```

4. Kiem tra:

```bash
docker compose logs -f
docker ps
curl http://127.0.0.1:3000/api/health
```

Luu y:

- Traefik tren VPS da xu ly `pdv.bitelbot.com` va SSL.
- File [docker-compose.yml](docker-compose.yml) da gan san labels cho Traefik.
- Can cau hinh DNS `A record` cho `pdv.bitelbot.com` tro ve IP VPS.

Moi lan cap nhat code:

```bash
cd /var/www/punto-venta-rewards
git pull
docker compose up -d --build
```

## File mau Google Sheets

File mau da tao san tai:

- `templates/google-sheet-template.xlsx`

Neu muon tao lai file mau:

```bash
npm run generate:sheet-template
```

Import vao Google Sheets:

1. Mo Google Drive.
2. Upload file `google-sheet-template.xlsx`.
3. Mo file bang Google Sheets.
4. Giu dung 3 sheet chinh `Stores`, `LevelTargets`, `DailyResults`.
5. Share file cho email service account voi quyen `Viewer`.

Tai khoan test san trong file mau:

- `CUSPS0001 / 123456`
- `CUSPS0002 / abc789`
- `CUSPS0003 / pdv2026`

De cai tren Android:

1. Deploy app len hosting co HTTPS.
2. Mo bang Chrome tren Android.
3. Chon `Add to Home Screen` hoac nut `Cai app tren Android`.

## Bien moi truong

```env
PORT=3000
APP_TIMEZONE=America/Lima
SESSION_SECRET=change-this-secret

GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_CLIENT_EMAIL=service-account@project-id.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_STORES_RANGE=Stores!A:L
GOOGLE_SHEETS_LEVEL_TARGETS_RANGE=LevelTargets!A:I
GOOGLE_SHEETS_RESULTS_RANGE=DailyResults!A:G
GOOGLE_SHEETS_CACHE_TTL_MS=60000
```

## Cau truc Google Sheets

### Sheet 1: `Stores`

Hang dau la tieu de cot:

| code | password | name | area | target_prepaid_new_line | target_prepaid_portabilidad | target_postpaid_new_line | target_postpaid_portabilidad | reward_prepaid_new_line | reward_prepaid_portabilidad | reward_postpaid_new_line | reward_postpaid_portabilidad |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| CUSPS0001 | 123456 | Punto San Isidro | Lima | 30 | 12 | 8 | 5 | 50 | 60 | 70 | 80 |

Ghi chu:

- `code` la user dang nhap.
- `password` la mat khau duoc cap.
- 4 cot target la chi tieu tong cua diem ban theo tung loai thue bao.
- 4 cot `reward_*` la tien thuong Soles Peru khi diem ban hoan thanh chi tieu tung loai thue bao.

### Sheet 2: `LevelTargets`

Moi dong la 1 muc chi tieu cua 1 diem ban.

| store_code | level_code | level_order | level_name | reward | target_prepaid_new_line | target_prepaid_portabilidad | target_postpaid_new_line | target_postpaid_portabilidad |
|---|---|---:|---|---:|---:|---:|---:|---:|
| CUSPS0001 | M1 | 1 | Mức 1 | 50 | 1 | 2 | 1 | 4 |
| CUSPS0001 | M2 | 2 | Mức 2 | 100 | 3 | 4 | 2 | 6 |
| CUSPS0001 | M3 | 3 | Mức 3 | 150 | 5 | 6 | 3 | 8 |

Ghi chu:

- `level_order` dung de sap xep thu tu hien thi.
- `reward` la tien thuong cua muc.
- 4 cot target la chi tieu con cua muc do.
- Muon them muc moi trong tuong lai, chi can them 1 dong moi vao sheet nay.

### Sheet 3: `DailyResults`

Hang dau la tieu de cot:

| date | store_code | prepaid_new_line | prepaid_portabilidad | postpaid_new_line | postpaid_portabilidad | note |
|---|---|---:|---:|---:|---:|---|
| 2026-04-08 | CUSPS0001 | 2 | 1 | 1 | 2 | Dia actual |

Ghi chu:

- Moi dong la ket qua cua 1 diem ban trong 1 ngay.
- App se tu cong tat ca cac dong den ngay hien tai de tinh `luỹ ke den ngay`.
- De cap nhat app, chi can sua hoac them dong trong `DailyResults`.
- Khuyen nghi dung dinh dang ngay `YYYY-MM-DD`.

## Logic tinh ket qua

- `Ket qua hom nay`: tong 4 loai thue bao cua ngay hien tai.
- `Luỹ ke den ngay`: tong tat ca dong `DailyResults` cua diem ban tu dau ky den ngay hien tai.
- `Tien do chi tieu tong`: lay `luỹ ke den ngay / chi tieu tong` cua tung loai thue bao.
- `Thuong theo loai thue bao`: neu luỹ ke cua loai do dat chi tieu tong thi diem ban nhan muc thuong cau hinh trong `Stores`.
- `Tien do muc`: app kiem tra tung chi tieu con trong `LevelTargets`.
- Mot muc chi duoc danh dau `Da dat` khi ca 4 chi tieu con deu dat.
- `Moc ke tiep`: muc dau tien chua dat, kem cac chi tieu con con thieu.
- `Tong so tien thuong`: lay tien thuong cua muc cao nhat da dat cong voi tong thuong cua cac loai thue bao da dat trong thang hien tai.

## Thiet lap quyen Google Sheets

1. Tao Service Account trong Google Cloud.
2. Bat Google Sheets API.
3. Tai file private key JSON tu service account.
4. Copy email service account vao `GOOGLE_SHEETS_CLIENT_EMAIL`.
5. Copy private key vao `GOOGLE_SHEETS_PRIVATE_KEY`, giu nguyen ky tu `\n`.
6. Share file Google Sheet cho email service account voi quyen `Viewer`.

## API chinh

- `POST /api/auth/login`: dang nhap bang `code` va `password`.
- `GET /api/dashboard`: lay dashboard cua diem ban dang login.
- `POST /api/auth/logout`: dang xuat.
- `GET /api/health`: kiem tra app va schema hien tai.

## Luu y

- App luu session dang nhap bang token o local storage cua trinh duyet.
- Hien tai day la PWA cai duoc tren Android. Neu can build APK/AAB native, co the boc them bang Capacitor sau.
