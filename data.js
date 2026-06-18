/**
 * data.js — Local Data Layer
 *
 * Acts as the app's "database" using localStorage as persistent storage.
 * All data is serialized to JSON on write and deserialized on read.
 *
 * Exports:
 *  - getExpenses()         → reads and returns the full transaction array
 *  - addExpense(dataForm)  → appends a new transaction and saves the updated array
 *  - deleteExpense(id)     → filters out the transaction with the given id and saves
 *  - getFinancialSummery() → iterates the array and returns { incomes, expenses, balance }
 *
 * Storage key: 'expensetracker_expenses' (single JSON array)
 */


// Constant key to avoid writing errors
const STORAGE_KEY = 'expensetracker_expenses'

/**
 * READ ALL EXPENSES
 * Return array of expenses or an empty array if is the first time to entry
 */
export function getExpenses(){
    const data = localStorage.getItem(STORAGE_KEY);
    if(data){
        return JSON.parse(data);    // Convert text to array
    } else{
        return [];     // Return empty array if there is nothing saved
    }
}

/**
 * ADD NEW EXPENSE
 * Receive an object with data of expense from form
 */
export function addExpense(dataForm){
    // 1. Get current list
    const expenses = getExpenses() ?? [];

    // 2. Create a new object adding an equal ID
    const newExpense = {
        id: Date.now().toString(), // ID based on actual time
        description: dataForm.description,
        amount: parseFloat(dataForm.amount), // Make sure it is a number
        type: dataForm.type, // 'income' or 'expense'
        category: dataForm.category,
        data: dataForm.data || new Date().toISOString().split('T')[0]
    };

    // 3. Add element to list
    expenses.push(newExpense);

    // 4. Save list at localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));

    return newExpense;
}

/**
 * DELETE EXPENSE
 * Receives ID of expense to delete
 */
export function deleteExpense(id){
    let expenses = getExpenses();

    // Filter list to get all expenses except one that has this id
    expenses = expenses.filter(expense => expense.id != id);

    // Save filtered list
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

/* CALCULATE FINANCIAL SUMMERY */
export function getFinancialSummery(){
    const expenses = getExpenses();
    let totalIncome = 0;
    let totalExpense = 0;

    expenses.forEach(item => {
        if(item.type === 'income'){
            totalIncome += item.amount;
        } else{
            totalExpense += item.amount;
        }
    });

    return {
        incomes: totalIncome,
        expenses: totalExpense,
        balance: totalIncome - totalExpense
    }
}