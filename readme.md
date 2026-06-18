# Expense Tracker

A lightweight personal finance tracker that runs entirely in the browser.
No server, no database, no dependencies — just HTML, CSS, and JavaScript.

---

## Features

- Add income and expense transactions with category, description, and date
- Dashboard with total balance, total income, and total expense
- Full transaction history with filters by type, category, and month
- Delete individual transactions
- Export filtered history to CSV (Excel-compatible)

---

## File Structure

```
expense-tracker/
├── index.html       — Dashboard: balance cards + last 5 transactions
├── add.html         — Form to add a new transaction
├── history.html     — Full transaction list with filters and CSV export
├── styles.css       — All styles (dark theme, monospace numbers)
├── data.js          — Data layer: read/write/delete via localStorage
├── ui.js            — Rendering layer: DOM manipulation functions
├── add.js           — Logic for add.html (toggle, validation, submit)
└── history.js       — Logic for history.html (filters, totals, export)
```

---

## How to Run

This app uses ES modules (`import`/`export`), so it requires a local server
— opening `index.html` directly in the browser will not work.

**Option 1 — VS Code (recommended):**
Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension,
right-click `index.html` and select **Open with Live Server**.

**Option 2 — Python:**
```bash
python -m http.server 5500
```
Then open `http://localhost:5500` in your browser.

---

## Data Model

Each transaction is stored as a JSON object:

```js
{
  id:          "lbz3k8x2a",       // unique ID based on timestamp
  description: "Supermarket",     // optional free text
  amount:      45.30,             // positive float
  type:        "expense",         // "expense" | "income"
  category:    "Food",            // see categories below
  data:        "2026-06-14"       // ISO date YYYY-MM-DD
}
```

All transactions are stored as a single JSON array under the
localStorage key `expensetracker_expenses`.

### Categories

| Expenses | Incomes |
|---|---|
| Food | Salary |
| Transport | Freelance |
| Housing | Investment |
| Health | |
| Entertainment | |
| Clothing | |
| Technology | |
| Other | |

---

## Architecture

The app follows a simple three-layer structure:

```
index.html / add.html / history.html   ← pages (structure + entry point)
        ↓
      ui.js                            ← rendering (DOM only, no logic)
        ↓
      data.js                          ← data (localStorage read/write)
```

Pages import from `ui.js` and `data.js`. `ui.js` imports from `data.js`.
No circular dependencies.

---

## Phase 2 — Planned (multi-user)

The current localStorage layer is designed to be replaceable.
The planned backend stack:

- **API:** Python + FastAPI
- **Database:** SQLite (development) → PostgreSQL (production)
- **Auth:** JWT tokens per user

To migrate, `data.js` would be replaced by API calls (`fetch`) pointing
to the FastAPI endpoints, with no changes needed in `ui.js` or the pages.