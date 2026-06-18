/**
 * ui.js — UI Rendering Layer
 *
 * Responsible for all DOM manipulation. Receives plain data objects and
 * converts them into HTML elements. No data logic lives here.
 *
 * Exports:
 *  - renderBalance(summary)                          → fills the three balance cards on index.html
 *  - renderTransactionList(transactions, id, delete) → builds a <ul> of transaction items
 *  - showMessage(text, type)                         → displays a timed success/error message
 *
 * Category colors are defined here in CATEGORY_COLORS and applied
 * as inline styles on each transaction badge.
 */


import { deleteExpense } from "./data.js";

// COLORS FOR CATEGORY
const CATEGORY_COLORS = {
    'Food':          '#1D9E75',
    'Transport':     '#378ADD',
    'Housing':       '#BA7517',
    'Health':        '#D4537E',
    'Entertainment': '#7F77DD',
    'Clothing':      '#D85A30',
    'Technology':    '#5F5E5A',
    'Other':         '#888780',
    
    // Ingressos
    'Salary':        '#1D9E75',
    'Freelance':     '#378ADD',
    'Investment':    '#BA7517',
}

/** HELPERS
 * Format a number as a coin
 * Equivelent to f"{amount:.2f} €"
 */
function formatAmount(amount){
    return parseFloat(amount).toFixed(2) + ' €';
}

/**
 * Make ISO date readable
 * "2026-06-14" --> "14 jun. 2026"
 */
function formatDate(isoDate){
    if(!isoDate) return '-';
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* Return the color of a category, or grey as default */
function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#888780';
}

/** RENDER BALANCE
 * Fill render cards of index.html
 * Receive object from getFinancialSummery(): { incomes: float, expenses: float, balance: float }
 */
export function renderBalance(summery){
    const balance = document.getElementById('balance');
    const income = document.getElementById('total-income');
    const expense = document.getElementById('total-expense');

    if(!balance || !income || !expense) return;

    income.textContent = formatAmount(summery.incomes);
    expense.textContent = formatAmount(summery.expenses);
    balance.textContent = formatAmount(summery.balance);

    // Balance color according to if it is positive or negative
    balance.classList.toggle('amount--positive', summery.balance >= 0);
    balance.classList.toggle('amount--negative', summery.balance < 0);
}

/** RENDER TRANSACTION LIST
 * Fill a list <ul> with given transactions
 * @param {Array} transactions  - array of expenses/incomes
 * @param {string} listId       - id of <ul> to renderize
 * @param {boolean} showDelete  - show delete button (for history)
 */
export function renderTransactionList(transactions, listId, showDelete=false){
    const list = document.getElementById(listId);
    if(!list) return;

    if(transactions.length === 0){
        list.innerHTML = '<li class="transaction-list__empty">No transactions found</li>';
        return;
    }

    list.innerHTML = transactions.map(t => renderTransactionItem(t, showDelete)).join('');

    // If show eliminate button, add listeners
    if(showDelete){
        list.querySelectorAll('.btn--delete').forEach(btn => {
            btn.addEventListener('click', () => handleDelete(btn.dataset.id, listId, showDelete));
        });
    }
}

/* Generate HTML of an individual transaction */
function renderTransactionItem(transaction, showDelete){
    const color = getCategoryColor(transaction.category);
    const isIncome = transaction.type === 'income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'amount--positive' : 'amount--negative';

    const deleteBtn = showDelete ? `<button class="btn btn--delete" data-id="${transaction.id}" title="Eliminate">X</button>` : '';

    return `
        <li class="transaction-item">
            <span class="transaction-item__badge"
                style="background:${color}20; color:${color}">
            ${transaction.category}
            </span>
            <span class="transaction-item__desc">${transaction.description || '—'}</span>
            <span class="transaction-item__date">${formatDate(transaction.data)}</span>
            <span class="transaction-item__amount ${amountClass}">
                ${sign}${formatAmount(transaction.amount)}
            </span>
            ${deleteBtn}
        </li>
    `;
}

/** DELETE GESTION
 * Delete a transaction and render the list
 */
async function handleDelete(id, listId, showDelete){
    const confirmed = confirm('Sure to eliminate transaction?');
    if(!confirmed) return;

    deleteExpense(id);

    //Reload and render actualized list
    // Dynamic import to avoid circular dependancy
    const { getExpenses } = await import('./data.js');
    const updated = getExpenses();
    renderTransactionList(updated, listId, showDelete);
}

/** STATE MESSAGES
 * Show a temporary message on element with id="message"
 * @param {string} text - text to show
 * @param {string} type - 'success' | 'error'
 */
export function showMessage(text, type='success'){
    const el = document.getElementById('message');
    if(!el) return;

    el.textContent = text;
    el.className = `message message--${type}`;
    el.style.display = 'block';

    setTimeout(() => { el.style.display = 'none'; }, 3000);
}