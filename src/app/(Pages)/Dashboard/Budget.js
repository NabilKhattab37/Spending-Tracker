import React, { useState, useEffect } from 'react';

function Budget() {
    // State to hold the budget value
    const [localBudget, setLocalBudget] = useState('');
    const [displayedBudget, setDisplayedBudget] = useState('');

    // Function to handle budget input change
    const handleBudgetChange = (event) => {
        setLocalBudget(event.target.value);
    };

    // Function to handle form submission
    const handleBudgetSubmit = (event) => {
        event.preventDefault();

        // Save the budget value to localStorage
        localStorage.setItem('budget', localBudget);

        // Trigger a storage event to notify other components
        window.dispatchEvent(new Event('budgetUpdated'));

        setLocalBudget("")
    };


    return (
        <div className="bg-white dark:bg-gray-800 h-auto p-4 rounded-xl">
            <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">Expense Tracker</h1>
            <form onSubmit={handleBudgetSubmit} className="max-w-xs mx-auto">
                <label className="block text-gray-700 dark:text-gray-300">
                    Enter Your Budget:
                    <input
                        type="number"
                        value={localBudget}
                        onChange={handleBudgetChange}
                        placeholder="Enter your budget"
                        required
                        className="mt-2 p-2 border rounded-md w-full text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                    />
                </label>
                <button
                    type="submit"
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 focus:outline-none focus:bg-blue-600"
                >
                    Set Budget
                </button>
            </form>
        </div>
    );
}

export default Budget;
