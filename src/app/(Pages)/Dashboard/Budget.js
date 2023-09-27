import React, { useState, useEffect } from 'react';
import {Box, Button, IconButton, Modal, TextField, Typography} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

function TransactionHistory({ transactions, onDeleteTransaction }) {
    const reversedTransactions = [...transactions].reverse();

    return (
        <div className="mt-4">
            <Typography variant="h6" className="mb-4">Transaction History</Typography>
            <ul className="list-disc mt-4 pl-4">
                {reversedTransactions.map((transaction, index) => (
                    <li key={index} className="mb-4 p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="text-lg font-semibold">Name: {transaction.name}</p>
                            <p className="text-gray-500">Category: {transaction.category}</p>
                            <p className="text-gray-500">Date: {transaction.date}</p>
                        </div>
                        <div>
                            <p className={`text-xl ${transaction.type === 'Revenue' ? 'text-green-500' : 'text-red-500'}`}>
                                {transaction.type === 'Revenue' ? `+ $${transaction.value}` : `- $${transaction.value}`}
                            </p>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => onDeleteTransaction(index)}
                                className="ml-2 border rounded-md"
                            >
                                Delete
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Budget() {
    const isClient = typeof window !== 'undefined';

    const [localBudget, setLocalBudget] = useState(
        isClient ? () => parseFloat(localStorage.getItem('budget')) || 0 : 0
    );
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

    const [transactions, setTransactions] = useState(
        JSON.parse(localStorage.getItem('transactions')) || []
    );

    useEffect(() => {
        // Calculate initial revenue and expenses from stored transactions in localStorage
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
    }, [localBudget, transactions]);

    useEffect(() => {
        // Update the current budget whenever revenue or expenses change
        const updatedCurrentBudget = parseFloat(localBudget) - expenses + revenue;
        setCurrentBudget(updatedCurrentBudget.toFixed(2));
    }, [localBudget, expenses, revenue]);

    const handleBudgetSubmit = (event) => {
        event.preventDefault();
        const newLocalBudget = parseFloat(localBudget);
        if (!isNaN(newLocalBudget)) {
            localStorage.setItem('budget', newLocalBudget.toString());
            setLocalBudget(newLocalBudget);
        } else {
            // Handle invalid input
        }
    };

    const handleClearTransactions = () => {
        // Clear transactions in localStorage
        localStorage.removeItem('transactions');

        // Reset revenue and expenses to zero
        setRevenue(0);
        setExpenses(0);

        // Reset localBudget to zero
        setLocalBudget(0);

        // Calculate the updated current budget
        const updatedCurrentBudget = 0;
        setCurrentBudget(updatedCurrentBudget.toFixed(2));

        // Update the displayed budget
        setDisplayedBudget(updatedCurrentBudget.toFixed(2));

        // Clear the transaction history by setting an empty array
        setTransactions([]);

        // Close the modal if it's open
        setOpen(false);
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
            const updatedTransactions = [...transactions, { ...details, type: transactionType }];
            localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

            // Clear the transaction details
            setTransactionDetails({
                value: '',
                category: '',
                date: '', // Reset date to null
                name: '',
            });

            setRecordingTransaction(false); // Clear the recording state
            setTransactions(updatedTransactions);
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

    const handleDeleteTransaction = (indexToDelete) => {
        // Remove the transaction at the specified index
        const updatedTransactions = [...transactions];
        updatedTransactions.splice(indexToDelete, 1);
        setTransactions(updatedTransactions);

        // Update revenue and expenses based on the updated transactions
        const updatedRevenue = updatedTransactions
            .filter((transaction) => transaction.type === 'Revenue')
            .reduce((total, transaction) => total + parseFloat(transaction.value), 0);

        const updatedExpenses = updatedTransactions
            .filter((transaction) => transaction.type === 'Expense')
            .reduce((total, transaction) => total + parseFloat(transaction.value), 0);

        setRevenue(updatedRevenue);
        setExpenses(updatedExpenses);

        // Update the current budget with the new values
        const updatedCurrentBudget = parseFloat(localBudget) - updatedExpenses + updatedRevenue;
        setCurrentBudget(updatedCurrentBudget.toFixed(2));

        // Update local storage with the updated transactions
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
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
        p: 4,
    };

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 h-auto p-4 rounded-xl">
                <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">Expense Tracker</h1>
                <h2 className="text-xl mb-4 text-gray-800 dark:text-white">Current Balance: ${currentBudget}</h2>
                <form onSubmit={handleBudgetSubmit} className="max-w-xs mx-auto flex space-x-4">
                    <Button onClick={handleOpen} variant="outlined" className="me-4 mt-4">New Transaction</Button>
                    <Button onClick={handleClearTransactions} startIcon={<DeleteIcon className="text-red-500"/>} variant="outlined" className="mt-4"><span>Clear Transactions</span></Button>
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style} className="bg-gray-800 rounded-2xl">
                            <Typography id="modal-modal-title" variant="h6" component="h2" className="text-center">
                                Select transaction type
                            </Typography>
                            <div className="flex space-x-3 mt-4 justify-center">
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
            <section>
                <TransactionHistory transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />
            </section>
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
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        p: 4,
    };

    return (
        <Modal
            open={true}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style} className="fixed items-center justify-center object-center z-50">
                <div className="bg-white dark:bg-gray-800 w-96 p-4 rounded-xl ">
                    <div className="relative " dir="rtl">
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={onClose} // Close the modal when the button is clicked
                            aria-label="close"
                            className="absolute top-0 right-0"

                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Record {type} Transaction
                    </Typography>
                    <form onSubmit={handleTransactionSubmit} className="space-y-4 mt-4">
                        <TextField
                            id="outlined-basic"
                            label="Name"
                            variant="outlined"
                            fullWidth
                            value={transactionDetails.name}
                            onChange={(e) =>
                                setTransactionDetails({ ...transactionDetails, name: e.target.value })
                            }
                        />
                        <TextField
                            id="outlined-basic"
                            label="Category"
                            variant="outlined"
                            fullWidth
                            value={transactionDetails.category}
                            onChange={(e) =>
                                setTransactionDetails({ ...transactionDetails, category: e.target.value })
                            }
                        />
                        <TextField
                            id="date"
                            type="date"
                            fullWidth
                            value={transactionDetails.date}
                            onChange={(e) =>
                                setTransactionDetails({ ...transactionDetails, date: e.target.value })
                            }
                        />
                        <TextField
                            id="standard-number"
                            label="Amount"
                            type="number"
                            fullWidth
                            placeholder="Amount"
                            value={transactionDetails.value}
                            onChange={(e) =>
                                setTransactionDetails({ ...transactionDetails, value: e.target.value })
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                            variant="standard"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            className="mt-4"
                        >
                            Record Transaction
                        </Button>
                    </form>
                </div>
            </Box>
        </Modal>
    );
}

export default Budget;
