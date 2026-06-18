/**
 * history.js — History Page Logic
 *
 * Handles all interactions on history.html:
 *  1. Populates the month filter dynamically from existing transaction dates.
 *  2. Applies up to three simultaneous filters (type, category, month)
 *     and re-renders the list on every filter change.
 *  3. Recalculates and displays the filtered total after each render.
 *  4. Overrides the delete behaviour from ui.js so that after deleting
 *     a transaction the active filters are preserved on re-render.
 *  5. Exports all transactions to a semicolon-separated CSV file
 *     (semicolon for Excel compatibility in Spanish/Catalan locale).
 *
 * Depends on: data.js (getExpenses, deleteExpense), ui.js (renderTransactionList)
 */


import { getExpenses, deleteExpense } from "./data.js";
import { renderTransactionList } from "./ui.js";

// 1. REFERENCES
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');
const filterMonth = document.getElementById('filter-month');
const totalEl = document.getElementById('history-total');
const btnExport = document.getElementById('btn-export');

// 2. AUTO FILL MONTH FILTER
function populateMonthFilter(){
    const transactions = getExpenses();
    const months = [...new Set(transactions.map(t => t.data.slice(0, 7)))].sort().reverse();

    months.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = formatMonth(m);
        filterMonth.appendChild(opt);
    });
}

function formatMonth(yyyymm){
    const [year, month] = yyyymm.split('-');
    const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${names[parseInt(month) - 1]} ${year}`;
}

// 3. FILTER AND RENDER
function applyFilterAndRender(){
    let transactions = getExpenses();

    // Apply filters
    const byType = filterType.value;
    const byCategory = filterCategory.value;
    const byMonth = filterMonth.value;

    if(byType) transactions = transactions.filter(t => t.type === byType);
    if(byCategory) transactions = transactions.filter(t => t.category === byCategory);
    if(byMonth) transactions = transactions.filter(t => t.data.startsWith(byMonth));

    // Order by date
    transactions.sort((a, b) => b.data.localeCompare(a.data));

    // Render list
    renderTransactionList(transactions, 'transaction-list', true);

    // Recalculate and show filtered total
    renderTotal(transactions);
}

// 4. FILTERED TOTAL
function renderTotal(transactions){
    const count = transactions.length;
    const incomes = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = incomes - expenses;

    const sign = balance >= 0 ? '+' : '';
    totalEl.textContent = `${count} transaction${count !== 1 ? 'ns' : ''} · Balance: ${sign}${balance.toFixed(2)} €`;
}

// 5. EXPORT CSV
function exportCSV(){
    const transactions = getExpenses();
    if(transactions.length === 0){
        alert('No transactions to export.');
        return;
    }

    const header = 'Date;Type;Category;Description;Amount\n';
    const rows = transactions.sort((a, b) => b.data.localeCompare(a.data)).map(t => `${t.data};${t.type};${t.category};"${t.description || ''}";${t.amount.toFixed(2)}`);
    
    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Create invisible link
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

/** ELIMINATE
 * Override of ui.js
 * renderTransitionList adds auto-eliminating listeners 
 */
document.getElementById('transaction-list').addEventListener('click', function(e){
    const btn = e.target.closest('.btn--delete');
    if(!btn) return;

    if(!confirm('Sure you want to eliminate this transaction?')) return;

    deleteExpense(btn.dataset.id);
    applyFilterAndRender();
});

// 7. INITIALIZATION
populateMonthFilter();
applyFilterAndRender();

// Listen changes on filters
filterType.addEventListener('change', applyFilterAndRender);
filterCategory.addEventListener('change', applyFilterAndRender);
filterMonth.addEventListener('change', applyFilterAndRender);

// Export button
btnExport.addEventListener('click', exportCSV);