import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, TextField, Typography } from "@mui/material";

function Budget() {
    const [localBudget, setLocalBudget] = useState(() => parseFloat(localStorage.getItem('budget')) || 0);
    const [displayedBudget, setDisplayedBudget] = useState(() => localBudget);
    const [currentBudget, setCurrentBudget] = useState(() => localBudget);

    const [isRecordingTransaction, setRecordingTransaction] = useState(false);
    const [transactionType, setTransactionType] = useState('');
    const [transactionDetails, setTransactionDetails] = useState({
        value: '',
        category: '',
        date: '',
        name: '',
    });

    const [revenue, setRevenue] = useState(0);
    const [expenses, setExpenses] = useState(0);

    useEffect(() => {
        // Calculate initial revenue and expenses from stored transactions in localStorage
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const initialRevenue = transactions
            .filter(transaction => transaction.type === 'Revenue')
            .reduce((total, transaction) => total + parseFloat(transaction.value), 0);
        const initialExpenses = transactions
            .filter(transaction => transaction.type === 'Expense')
            .reduce((total, transaction) => total + parseFloat(transaction.value), 0);

        setRevenue(initialRevenue);
        setExpenses(initialExpenses);

        // Calculate the initial current budget based on the budget value
        const initialCurrentBudget = parseFloat(localBudget) - initialExpenses + initialRevenue;
        setCurrentBudget(initialCurrentBudget.toFixed(2));
    }, [localBudget]); // Include localBudget as a dependency

    const handleBudgetSubmit = (event) => {
        event.preventDefault();

        // Parse the input value as a float and set it as the new localBudget
        const newLocalBudget = parseFloat(localBudget);
        if (!isNaN(newLocalBudget)) {
            localStorage.setItem('budget', newLocalBudget.toString()); // Store as a string
            setLocalBudget(newLocalBudget); // Update localBudget as a number

            // Update the current budget with the new budget value
            const updatedCurrentBudget = newLocalBudget - expenses + revenue;
            setCurrentBudget(updatedCurrentBudget.toFixed(2));
        } else {
            // Handle invalid input (e.g., non-numeric input)
            // You can display an error message or take appropriate action here
        }
    };

    // Clear Transactions Function
    const handleClearTransactions = () => {
        // Clear transactions in localStorage
        localStorage.removeItem('transactions');

        // Reset revenue and expenses to zero
        setRevenue(0);
        setExpenses(0);

        // Calculate the updated current budget
        const updatedCurrentBudget = localBudget - expenses + revenue;
        setCurrentBudget(updatedCurrentBudget.toFixed(2));

        // Update the displayed budget
        setDisplayedBudget(updatedCurrentBudget.toFixed(2));
    };

    // Refresh Function
    const handleRefresh = () => {
        // Reload the page to reflect changes
        window.location.reload();
    };

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const handleTransactionRecording = (type) => {
        setTransactionType(type);
        setRecordingTransaction(true);
    };

    const handleRecordTransaction = (details) => {
        // Parse the value as a float
        const floatValue = parseFloat(details.value);

        if (!isNaN(floatValue)) {
            let updatedBudget = parseFloat(displayedBudget);

            if (transactionType === 'Revenue') {
                const addedRevenue = floatValue;
                setRevenue(revenue + addedRevenue);
                updatedBudget += addedRevenue;
            } else if (transactionType === 'Expense') {
                const addedExpense = floatValue;
                setExpenses(expenses + addedExpense);
                updatedBudget -= addedExpense;
            }

            // Store the transaction in localStorage
            const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
            transactions.push({ ...details, type: transactionType });
            localStorage.setItem('transactions', JSON.stringify(transactions));

            // Clear the transaction details
            setTransactionDetails({
                value: '',
                category: '',
                date: '', // Reset date to null
                name: '',
            });

            setRecordingTransaction(false); // Clear the recording state
            setTransactionType('');

            // Update the displayed budget immediately
            setDisplayedBudget(updatedBudget.toFixed(2));

            // Update the current budget with the new budget value
            const updatedCurrentBudget = updatedBudget - expenses + revenue;
            setCurrentBudget(updatedCurrentBudget.toFixed(2));

            // Dispatch an event to notify other components of the budget update
            window.dispatchEvent(new Event('budgetUpdated'));
        } else {
            // Handle invalid input (e.g., non-numeric input for transaction value)
            // You can display an error message or take appropriate action here
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 h-auto p-4 rounded-xl">
            <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">Expense Tracker</h1>
            <h2 className="text-xl mb-4 text-gray-800 dark:text-white">Current Budget: ${currentBudget}</h2>
            <form onSubmit={handleBudgetSubmit} className="max-w-xs mx-auto">
                <Button onClick={handleOpen} variant="outlined" className="me-4 mt-4">New Transaction</Button>
                <Button onClick={handleClearTransactions} variant="outlined" className="me-4 mt-4">Clear Transactions</Button>
                <Button onClick={handleRefresh} variant="outlined" className="me-4 mt-4">Refresh</Button>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style} className="bg-gray-800">
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Select transaction type
                        </Typography>
                        <div className="flex justify-center">
                            <Button onClick={() => handleTransactionRecording('Revenue')} variant="outlined" className="me-4 mt-4 border rounded-md">Revenue</Button>
                            <Button onClick={() => handleTransactionRecording('Expense')} variant="outlined" className="me-4 mt-4 border rounded-md">Expense</Button>
                        </div>
                    </Box>
                </Modal>
                {isRecordingTransaction && (
                    <TransactionRecording
                        type={transactionType}
                        onClose={() => {
                            setRecordingTransaction(false);
                            setTransactionType('');
                        }}
                        onRecord={handleRecordTransaction}
                    />
                )}
            </form>
        </div>
    );
}

function TransactionRecording({ type, onClose, onRecord }) {
    const [transactionDetails, setTransactionDetails] = useState({
        value: '',
        category: '',
        date: '',
        name: '',
    });

    const handleTransactionSubmit = (event) => {
        event.preventDefault();

        onRecord({
            type,
            ...transactionDetails,
        });

        setTransactionDetails({
            value: '',
            category: '',
            date: '',
            name: '',
        });

        onClose();
    };

    return (
        <Modal
            open={true}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className="bg-gray-800 flex justify-center mt-40 space-x-4">
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Record {type} Transaction
                </Typography>
                <form onSubmit={handleTransactionSubmit} className="space-x-4">
                    <TextField id="outlined-basic" label="Name" variant="outlined"
                               value={transactionDetails.name}
                               onChange={(e) => setTransactionDetails({ ...transactionDetails, name: e.target.value })}
                    />
                    <TextField id="outlined-basic" label="Category" variant="outlined"
                               value={transactionDetails.category}
                               onChange={(e) => setTransactionDetails({ ...transactionDetails, category: e.target.value })}
                    />
                    <TextField
                        id="date"
                        type="date"
                        value={transactionDetails.date}
                        onChange={(e) => setTransactionDetails({ ...transactionDetails, date: e.target.value })}
                    />
                    <TextField
                        id="standard-number"
                        label="Amount"
                        type="number"
                        placeholder="Amount"
                        value={transactionDetails.value}
                        onChange={(e) => setTransactionDetails({ ...transactionDetails, value: e.target.value })}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="standard"
                    />
                    <Button type="submit" variant="outlined" className="me-4 mt-4 border rounded-md">Record Transaction</Button>
                </form>
            </Box>
        </Modal>
    );
}

export default Budget;
