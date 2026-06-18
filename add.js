/**
 * add.js — Add Transaction Page Logic
 *
 * Handles all interactions on add.html:
 *  1. Sets today's date as the default value for the date input.
 *  2. Manages the Expense / Income toggle: updates button styles and
 *     writes the selected type to the hidden #type input.
 *  3. On form submit: reads all field values, validates amount and
 *     category, calls addExpense() from data.js, and shows feedback
 *     via showMessage() from ui.js.
 *
 * Depends on: data.js (addExpense), ui.js (showMessage)
 */


import { addExpense } from './data.js';
import { showMessage } from './ui.js';

// 1. REFERENCES TO ELEMENTS
const form = document.getElementById('expense-form');
const inputType = document.getElementById('type');
const inputAmount = document.getElementById('amount');
const inputData = document.getElementById('data');

// 2. TODAY AS DEFAULT
inputData.value = new Date().toISOString().split('T')[0];

// 3. TOGGLE EXPENSE / INCOME
document.querySelectorAll('.type-toggle__btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;  // 'expense' or 'income'
        inputType.value = type;
        document.querySelectorAll('.type-toggle__btn').forEach(b => {
            b.classList.remove('active--expense', 'active--income');
        });
        btn.classList.add(type === 'expense' ? 'active--expense' : 'active--income');
    });
});

// 4. SUBMIT
form.addEventListener('submit', function(event) {
    event.preventDefault();

    // Read values - names must match what addExpense() expects
    const formData = {
        description: document.getElementById('description').value.trim(),
        amount: document.getElementById('amount').value,
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        data: document.getElementById('data').value
    };

    if(!formData.category){
        showMessage('Choose one category', 'error');
        return;
    }

    if(parseFloat(formData.amount) <= 0){
        showMessage('L\'amount has to be positive.', 'error');
        return;
    }

    addExpense(formData);
    showMessage('Transaction saved!', 'success');

    form.reset();
    inputData.value = new Date().toISOString().split('T')[0];
    inputType.value = 'expense';
    document.querySelector('[data-type="expense"]').classList.add('active--expense');
    document.querySelector('[data-type="income"]').classList.remove('active--income');
});