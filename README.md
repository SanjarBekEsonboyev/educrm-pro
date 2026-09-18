# EduCRM Pro — Full-Stack Edition

To'liq React (frontend) + Node.js/Express (backend, SQLite) arxitekturasiga o'tkazilgan, 3 tilda (O'zbek / Rus / Ingliz) ishlaydigan o'quv markazi CRM tizimi.

## Tuzilma

```
educrm-pro/
├── backend/     Node.js + Express + SQLite (better-sqlite3) REST API
└── frontend/    React 18 + Vite + React Router + i18next
```

## Tezkor ishga tushirish

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # kerak bo'lsa JWT_SECRET ni o'zgartiring
npm run start              # http://localhost:4000
```

Birinchi marta ishga tushirilganda ma'lumotlar bazasi (`backend/data/educrm.db`) avtomatik yaratiladi. Seed faqat **admin** va **direktor** login hisoblarini yaratadi — hech qanday demo kurs/guruh/o'qituvchi/o'quvchi qo'shilmaydi. Haqiqiy kurs/guruh/o'quvchi ma'lumotlari quyidagi "Sentyabr.xlsx" import bo'limi orqali qo'shiladi.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL ni sozlang (default: http://localhost:4000/api)
npm run dev                 # http://localhost:5173
```

Production build uchun: `npm run build` (natija `frontend/dist/` papkasida, istalgan static hosting orqali serve qilinadi; `VITE_API_URL` build vaqtida backend manzilini ko'rsatishi kerak).

## Test loginlar

Seed faqat quyidagi ikkita hisobni yaratadi (boshqa barcha login — o'qituvchilar — import orqali avtomatik yaratiladi, pastga qarang):

| Rol       | Login      | Parol     |
|-----------|-----------|-----------|
| Admin     | admin     | admin123  |
| Direktor  | director  | dir123    |

## "Sentyabr.xlsx" — real ma'lumotlarni import qilish

`backend/data/imports/sentyabr-import.json` fayli sizning haqiqiy Excel jadvalingizdan (5 varaq: ingiliz tili, grafik dizayn, Buxalteriya, web dasturlash, Kompuyuter savodxonligi) chiqarilgan 5 ta kurs, 17 ta guruh va 54 ta o'quvchi ma'lumotini o'z ichiga oladi. Tizimda **faqat shu ro'yxatdagi ma'lumotlar** bo'lishi uchun (hech qanday demo/soxta ma'lumot yo'q), quyidagi ikki buyruqni ketma-ket ishga tushiring:

```bash
cd backend
npm run seed              # bazani tozalab, faqat admin+direktor hisoblarini yaratadi
npm run import:sentyabr   # haqiqiy kurs/guruh/o'qituvchi/o'quvchi ma'lumotlarini qo'shadi
```

**Agar bazada avvaldan demo ma'lumotlar bo'lsa** (masalan, eski versiyada ishga tushirgan bo'lsangiz), avval bazani butunlay o'chirib, keyin yuqoridagi ikki buyruqni bajaring:

```bash
cd backend
del data\educrm.db data\educrm.db-wal data\educrm.db-shm   # Windows (cmd)
# yoki: rm -f data/educrm.db data/educrm.db-wal data/educrm.db-shm   (macOS/Linux)
npm run seed
npm run import:sentyabr
npm run start
```

Skript **xavfsiz qayta ishga tushiriladi** — agar allaqachon import qilingan bo'lsa, takroriy o'quvchi/guruh yaratmaydi (ism+telefon+kurs bo'yicha tekshiradi).

Import vaqtida quyidagi yangi o'qituvchi hisoblari avtomatik yaratiladi (parolni "Sozlamalar"dan keyinroq o'zgartirishingiz mumkin):

| O'qituvchi | Login | Parol | Izoh |
|---|---|---|---|
| Intizor | intizor | intizor123 | English guruhi |
| Zikriyo | zikriyo | zikriyo123 | English + Savodxonlik guruhlari |
| Nodir | nodir | nodir123 | 1C (Buxalteriya) guruhlari |
| Grafik dizayn instruktori | grafikdizayninstruktori | grafikdizayninstruktori123 | Excel faylida ism ko'rsatilmagan — vaqtinchalik hisob, keyin haqiqiy o'qituvchi nomiga o'zgartiring |
| Web dasturlash instruktori | webdasturlashinstruktori | webdasturlashinstruktori123 | Excel faylida ism ko'rsatilmagan — vaqtinchalik hisob |
| Savodxonlik instruktori | savodxonlikinstruktori | savodxonlikinstruktori123 | Excel faylida ism ko'rsatilmagan — vaqtinchalik hisob |

**E'tibor bering:** "Grafik dizayn" kursi uchun Excel faylida hech qanday to'lov summasi qayd etilmagan edi, shuning uchun narxi 0 so'm qilib import qilindi — buni **Kurslar** sahifasidan qo'lda to'g'irlang.

## Arxitektura

**Backend** — Node.js/Express, JWT-based autentifikatsiya (bcrypt bilan parollarni hash qilish), rolga asoslangan ruxsatlar (admin / director / teacher), SQLite (`better-sqlite3`) orqali persistent ma'lumotlar. Asosiy modullar to'liq REST API orqali ishlaydi:

- `auth` — login, joriy foydalanuvchi
- `users` — o'qituvchilar CRUD, bonus qo'shish
- `courses` — kurslar CRUD
- `groups` — guruhlar CRUD, guruhni tasdiqlash (waiting → active, barcha kutayotgan o'quvchilarni faollashtirish)
- `students` — o'quvchilar CRUD, to'lov qabul qilish, guruhdan chiqarish (pro-rata qaytarish hisobi), davomat belgilash
- `admissions` — yangi qabul arizalari, tasdiqlash/rad etish, avtomatik guruhga biriktirish
- `payments` — to'lovlar tarixi, chek ma'lumotlari
- `fines` — o'qituvchilarga jarima
- `expenses` — chiqimlar
- `sms` — SMS yuborish simulyatsiyasi va tarixi

Teacher roli faqat o'ziga tegishli guruh/o'quvchi/jarima ma'lumotlarini ko'radi — bu server tomonida (route darajasida) ta'minlangan, frontendga ishonib qolinmagan.

**Frontend** — React 18 (Vite), React Router v6 bilan sahifalarga bo'lingan (har bir bo'lim — Dashboard, Qabul, Guruhlar, O'quvchilar, O'qituvchilar, Kurslar, Davomat, Jadval, Moliya, SMS, Hisobotlar, Sozlamalar, va 20 ta qo'shimcha modul — alohida fayllarda), markazlashgan `DataContext` orqali backenddan ma'lumot oladi (asl ilovadagi `db`/`upDb` patterniga o'xshash, lekin haqiqiy API chaqiruvlari bilan). Uch tillilik `react-i18next` orqali amalga oshirilgan (`src/i18n/locales/{uz,en,ru}.json`), til tanlovchisi har doim ko'rinadi va tanlov `localStorage`da saqlanadi.

## Eslatma — 20 ta qo'shimcha modul haqida

Asl faylda "80+ features" sifatida ko'rsatilgan 20 ta qo'shimcha panel (Sales Pipeline, AI Analytics, LMS, Inventar, Audit Log, Ota-ona Panel, va h.k.) asl kodda ham asosiy `db`ga yozilmagan — ular faqat demo/vizual paneller edi (frontendning o'z ichki holatida ishlaydi). Ular shu tarzda saqlab qolindi: real backend ma'lumotlaridan (o'quvchilar, guruhlar, to'lovlar) foydalanib analitika ko'rsatadi, lekin o'zlarining qo'shimcha yozuvlari (masalan, sotuv pipeline lidlari, vazifalar ro'yxati) sahifa local state'ida saqlanadi — xohlasangiz, ularni ham to'liq backend jadvallariga ulash mumkin (arxitektura shunga tayyor: har bir modul frontend sahifasi + kerak bo'lsa yangi `routes/*.routes.js` fayli qo'shish orqali).

## Ishlab chiqarishga tayyorlash bo'yicha tavsiyalar

- `JWT_SECRET` ni albatta o'zgartiring va uni maxfiy saqlang.
- HTTPS ortida ishga tushiring (masalan, nginx reverse proxy).
- `CORS_ORIGIN` ni frontend domeningizga moslang.
- SQLite fayli (`backend/data/educrm.db`) muntazam backup qilinishi kerak.
