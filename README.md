# Fitness Výzva – hotová PWA (Next.js) + Google Sheets (Apps Script)

## Co to je
Mobile-first web appka (PWA) pro 10 lidí:
- Login: email + PIN
- Dnes: splněno/bonus/penalizace/poznámka
- Dashboard: body + progres + posledních 7 dní
- Historie
- Žebříček TOP 10
- Admin: všechny záznamy

## Co potřebuješ
- Google Sheet s listy USERS, SETTINGS, RECORDS
- V listu USERS sloupec `pin` (doplnit)
- Apps Script Web App URL -> použiješ jako NEXT_PUBLIC_API_BASE

## Lokální spuštění
npm i
npm run dev
.env.local:
NEXT_PUBLIC_API_BASE=https://SCRIPT_URL/exec

## Deploy (Vercel)
- Importuj projekt
- Nastav ENV `NEXT_PUBLIC_API_BASE`
- Deploy
