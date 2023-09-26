import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, TextField, Typography } from "@mui/material";

function Budget({ currentBudget, onTransactionRecord }) {
    const [localBudget, setLocalBudget] = useState(() => parseFloat(localStorage.getItem('budget')) || 0);
    const [displayedBudget, setDisplayedBudget] = useState(() => currentBudget || localBudget);

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
    }, []);

    const handleBudgetChange = (event) => {
        setLocalBudget(event.target.value);
    };

    const handleBudgetSubmit = (event) => {
        event.preventDefault();

        localStorage.setItem('budget', localBudget);

        window.dispatchEvent(new Event('budgetUpdated'));

        const calculatedBudget = parseFloat(localBudget) + revenue - expenses;
        setDisplayedBudget(calculatedBudget.toFixed(2));

        setLocalBudget("");
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
        let updatedBudget = parseFloat(displayedBudget);

        if (transactionType === 'Revenue') {
            const addedRevenue = parseFloat(details.value);
            setRevenue(revenue + addedRevenue);
            updatedBudget += addedRevenue;
        } else if (transactionType === 'Expense') {
            const addedExpense = parseFloat(details.value);
            setExpenses(expenses + addedExpense);
            updatedBudget -= addedExpense;
        }

        // Store the transaction in localStorage
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        transactions.push({ ...details, type: transactionType });
        localStorage.setItem('transactions', JSON.stringify(transactions));

        setRecordingTransaction(false);
        setTransactionType('');

        setDisplayedBudget(updatedBudget.toFixed(2));

        onTransactionRecord(updatedBudget.toFixed(2));
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
                <Button variant="outlined" type="submit" className="me-4 mt-4" >Submit</Button>
                <Button onClick={handleOpen} variant="outlined" className="me-4 mt-4">New Transaction</Button>
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
