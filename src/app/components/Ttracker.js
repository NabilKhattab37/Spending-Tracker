'use client'
import React, {useEffect, useState} from 'react';
import {Box, Button, IconButton, InputLabel, Modal, TextField, Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Papa from 'papaparse';
import axios from 'axios';

function TransactionHistory({transactions, onDeleteTransaction}) {
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showLast30Days, setShowLast30Days] = useState(false);

    const filteredTransactions = transactions.filter((transaction) => {
        const dateA = new Date(transaction.date);
        const dateB = new Date();

        const categoryMatch = selectedCategory === '' || transaction.category === selectedCategory;
        const last30Days = showLast30Days ? dateB - dateA <= 30 * 24 * 60 * 60 * 1000 : true;

        return categoryMatch && last30Days;
    });

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (sortOrder === 'asc') {
            return dateA - dateB;
        } else {
            return dateB - dateA;
        }
    });

    const categories = Array.from(new Set(transactions.map((transaction) => transaction.category)));

    return (
        <div className="mt-4">
            <div className="flex mb-4">
                <Typography className="place-self-center" variant="h6">
                    Transaction History
                </Typography>
                <div className="flex space-x-4 ms-2">
                    <FormControl sx={{m: 1, minWidth: 150}}>
                        <Select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            variant="outlined"
                            style={{borderColor: 'primary', color: 'primary'}}
                        >
                            <MenuItem value="desc">Newest</MenuItem>
                            <MenuItem value="asc">Oldest</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{m: 1, minWidth: 150}}>
                        <InputLabel id="categoryid">Category</InputLabel>
                        <Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            variant="outlined"
                            labelId="categoryid"
                            id="categoryid"
                            label="Category"
                            style={{borderColor: 'primary', color: 'primary'}}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{m: 1, minWidth: 150}}>
                        <Button
                            variant="outlined"
                            className="w-auto h-[56px]"
                            style={{
                                borderColor: showLast30Days ? 'primary' : 'default',
                                color: showLast30Days ? 'primary' : 'default',
                            }}
                            onClick={() => setShowLast30Days(!showLast30Days)}
                        >
                            Last 30 Days
                        </Button>
                    </FormControl>
                </div>
            </div>
            <div className="max-h-[50vh] overflow-y-scroll scroll-smooth pe-4" style={{ scrollbarWidth: 'thin' }}>
                <ul className="list-disc mt-4">
                    {sortedTransactions.map((transaction, index) => (
                        <li key={transaction.id || index} className="mb-4 p-4 border rounded-lg flex justify-between items-center">
                            <div>
                                <p className="text-lg font-semibold">Name: {transaction.name}</p>
                                <p className="text-gray-500">Category: {transaction.category}</p>
                                <p className="text-gray-500">Date: {transaction.date}</p>
                            </div>
                            <div>
                                <p
                                    className={`text-xl ${
                                        transaction.type === 'Revenue' ? 'text-green-500' : 'text-red-500'
                                    }`}
                                >
                                    {transaction.type === 'Revenue' ? `+ $${transaction.value}` : `- $${transaction.value}`}
                                </p>
                                <div className="mt-1 ms-2">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            // FIXED: Find the original index in the full transactions array
                                            const originalIndex = transactions.findIndex(t => 
                                                t.id ? t.id === transaction.id : 
                                                t.name === transaction.name && t.date === transaction.date && t.value === transaction.value
                                            );
                                            onDeleteTransaction(originalIndex);
                                        }}
                                        className="ml-2 border rounded-md"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function Ttracker() {
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
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // FIXED: Added missing balanceThreshold state
    const [showAlert, setShowAlert] = useState(false);
    const initialBalanceThreshold = typeof localStorage !== 'undefined' ? localStorage.getItem('balanceThreshold') || '0' : '0';
    const [balanceThreshold, setBalanceThreshold] = useState(initialBalanceThreshold);

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/transactions');
                setTransactions(response.data);
                console.log('Loaded transactions from database:', response.data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                // Fallback to localStorage if API fails
                if (typeof window !== 'undefined') {
                    const localStorageData = localStorage.getItem('transactions');
                    const parsedData = localStorageData ? JSON.parse(localStorageData) : [];
                    setTransactions(parsedData);
                    console.log('Fallback: Loaded transactions from localStorage');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    useEffect(() => {
        const initialRevenue = transactions
            .filter(transaction => transaction.type === 'Revenue')
            .reduce((total, transaction) => total + parseFloat(transaction.value), 0);
        const initialExpenses = transactions
            .filter(transaction => transaction.type === 'Expense')
            .reduce((total, transaction) => total + parseFloat(transaction.value), 0);

        setRevenue(initialRevenue);
        setExpenses(initialExpenses);

        const initialCurrentBudget = parseFloat(localBudget) - initialExpenses + initialRevenue;
        setCurrentBudget(initialCurrentBudget.toFixed(2));
    }, [localBudget, transactions]);

    useEffect(() => {
        const updatedCurrentBudget = parseFloat(localBudget) - expenses + revenue;
        setCurrentBudget(updatedCurrentBudget.toFixed(2));
    }, [localBudget, expenses, revenue]);

    useEffect(() => {
        if (typeof localStorage !== 'undefined') {
            const threshold = parseFloat(balanceThreshold);
            if (currentBudget < threshold) {
                setShowAlert(true);
            } else {
                setShowAlert(false);
            }
            localStorage.setItem('balanceThreshold', balanceThreshold);
        }
    }, [currentBudget, balanceThreshold]);

    const handleBudgetSubmit = (event) => {
        event.preventDefault();
        const newLocalBudget = parseFloat(localBudget);
        if (!isNaN(newLocalBudget)) {
            localStorage.setItem('budget', newLocalBudget.toString());
            setLocalBudget(newLocalBudget);
        }
    };

    const handleClearTransactions = async () => {
        try {
            for (const transaction of transactions) {
                if (transaction.id) {
                    await axios.delete(`/api/transactions/${transaction.id}`);
                }
            }
            
            localStorage.removeItem('transactions');

            setRevenue(0);
            setExpenses(0);
            setBalanceThreshold('0'); // FIXED: Use string value
            setLocalBudget(0);
            setCurrentBudget('0.00');
            setDisplayedBudget('0.00');
            setTransactions([]);
            setOpen(false);
            
            console.log('All transactions cleared from database');
        } catch (error) {
            console.error('Error clearing transactions:', error);
            localStorage.removeItem('transactions');
            setTransactions([]);
        }
    };

    const handleTransactionRecording = (type) => {
        setTransactionType(type);
        setRecordingTransaction(true);
    };

    const handleRecordTransaction = async (details) => {
        const floatValue = parseFloat(details.value);

        if (!isNaN(floatValue)) {
            try {
                const response = await axios.post('/api/transactions', {
                    ...details,
                    type: transactionType,
                    value: floatValue
                });

                console.log('Transaction saved to database:', response.data);

                const newTransaction = response.data;
                const updatedTransactions = [...transactions, newTransaction];
                setTransactions(updatedTransactions);

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

                localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

                setTransactionDetails({
                    value: '',
                    category: '',
                    date: '',
                    name: '',
                });

                setRecordingTransaction(false);
                setTransactionType('');
                setDisplayedBudget(updatedBudget.toFixed(2));

                const updatedCurrentBudget = updatedBudget - expenses + revenue;
                setCurrentBudget(updatedCurrentBudget.toFixed(2));

                window.dispatchEvent(new Event('budgetUpdated'));

            } catch (error) {
                console.error('Error saving transaction to database:', error);
                
                const fallbackTransaction = {...details, type: transactionType, id: Date.now()};
                const updatedTransactions = [...transactions, fallbackTransaction];
                localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
                setTransactions(updatedTransactions);
                
                alert('Failed to save to database, saved locally instead.');
            }
        }
    };

    const handleCSV = (event, action) => {
        if (action === 'upload') {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const fileContent = e.target.result;

                    Papa.parse(fileContent, {
                        header: true,
                        dynamicTyping: true,
                        complete: (results) => {
                            const parsedData = results.data;
                            setTransactions(parsedData);
                        },
                        error: (error) => {
                            console.error('CSV parsing error:', error.message);
                        },
                    });
                };

                reader.readAsText(file);
            }
        } else if (action === 'download') {
            const csvData = transactions.map((transaction) => ({
                Name: transaction.name,
                Category: transaction.category,
                Date: transaction.date,
                Type: transaction.type,
                Value: transaction.value,
            }));

            const csvContent = Papa.unparse(csvData);
            const blob = new Blob([csvContent], {type: 'text/csv'});
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'transaction_history.csv';
            a.click();

            window.URL.revokeObjectURL(url);
            a.remove();
        }
    };

    const handleDeleteTransaction = async (indexToDelete) => {
        const transactionToDelete = transactions[indexToDelete];
        
        try {
            if (transactionToDelete.id) {
                await axios.delete(`/api/transactions/${transactionToDelete.id}`);
                console.log('Transaction deleted from database');
            }

            const updatedTransactions = [...transactions];
            updatedTransactions.splice(indexToDelete, 1);
            setTransactions(updatedTransactions);

            const updatedRevenue = updatedTransactions
                .filter((transaction) => transaction.type === 'Revenue')
                .reduce((total, transaction) => total + parseFloat(transaction.value), 0);

            const updatedExpenses = updatedTransactions
                .filter((transaction) => transaction.type === 'Expense')
                .reduce((total, transaction) => total + parseFloat(transaction.value), 0);

            setRevenue(updatedRevenue);
            setExpenses(updatedExpenses);

            const updatedCurrentBudget = parseFloat(localBudget) - updatedExpenses + updatedRevenue;
            setCurrentBudget(updatedCurrentBudget.toFixed(2));

            localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete from database, but removed locally.');
        }
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        p: 4,
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl">Loading transactions...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 h-auto p-4 rounded-xl justify-center text-center">
                {showAlert && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <strong className="font-bold">Alert! </strong>
                        <span className="block sm:inline">Your balance has fallen below the threshold.</span>
                    </div>
                )}
                <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">Spending Tracker</h1>
                <h2
                    className={`text-xl mb-4 ${currentBudget < parseFloat(balanceThreshold) ? 'text-red-500' : 'text-gray-800'} dark:text-white`}
                >
                    Balance Threshold:
                    <input
                        type="number"
                        value={balanceThreshold}
                        onChange={(e) => setBalanceThreshold(e.target.value)}
                        className="border ms-2 w-auto border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-3 mb-4"
                        placeholder="Enter balance threshold"
                    />
                </h2>
                <h2 className="text-xl mb-4 text-gray-800 dark:text-white">Current Balance: ${currentBudget}</h2>
                <form onSubmit={handleBudgetSubmit} className="justify-center items-center flex">
                    <FormControl sx={{m: 1, minWidth: 150}}>
                        <Button onClick={handleOpen} variant="outlined">
                            New Transaction
                        </Button>
                    </FormControl>
                    <FormControl sx={{m: 1, minWidth: 150}}>
                        <Button
                            onClick={handleClearTransactions}
                            startIcon={<DeleteIcon className="text-red-500"/>}
                            variant="outlined"
                        >
                            <span>Clear Transactions</span>
                        </Button>
                    </FormControl>
                    <FormControl sx={{m: 1, minWidth: 150}}>
                        <Button variant="outlined" onClick={(e) => handleCSV(e, 'download')}>
                            Download CSV
                        </Button>
                    </FormControl>
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
                            <div className="flex mt-4 space-x-6 items-center justify-center">
                                <Button onClick={() => handleTransactionRecording('Revenue')} variant="outlined"
                                        className="mt-4 border rounded-md">Revenue</Button>
                                <Button onClick={() => handleTransactionRecording('Expense')} variant="outlined"
                                        className="mt-4 border rounded-md">Expense</Button>
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
                <TransactionHistory transactions={transactions} onDeleteTransaction={handleDeleteTransaction}/>
            </section>
        </div>
    );
}

function TransactionRecording({type, onClose, onRecord}) {
    const [transactionDetails, setTransactionDetails] = useState({
        value: '',
        category: '',
        date: '',
        name: '',
    });
    const [formErrors, setFormErrors] = useState({
        name: false,
        category: false,
        date: false,
        value: false,
    });

    const handleTransactionSubmit = (event) => {
        event.preventDefault();

        // Check if any required fields are empty
        const errors = {
            name: !transactionDetails.name,
            category: !transactionDetails.category,
            date: !transactionDetails.date,
            value: !transactionDetails.value,
        };

        setFormErrors(errors);

        // If there are errors, prevent form submission
        if (Object.values(errors).some((error) => error)) {
            return;
        }

        // If all required fields are filled, proceed with recording the transaction
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
            <Box sx={style}>
                <div className="bg-white dark:bg-gray-800 w-96 p-4 rounded-xl relative">
                    <div className="relative ">
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={onClose}
                            aria-label="close"
                            className="absolute top-0 right-0"
                        >
                            <CloseIcon/>
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
                                setTransactionDetails({...transactionDetails, name: e.target.value})
                            }
                            error={formErrors.name}
                            helperText={formErrors.name && 'Please enter a name.'}
                        />
                        <TextField
                            id="outlined-basic"
                            label="Category"
                            variant="outlined"
                            fullWidth
                            value={transactionDetails.category}
                            onChange={(e) =>
                                setTransactionDetails({...transactionDetails, category: e.target.value})
                            }
                            error={formErrors.category}
                            helperText={formErrors.category && 'Please enter a category.'}
                        />
                        <TextField
                            id="date"
                            type="date"
                            fullWidth
                            value={transactionDetails.date}
                            onChange={(e) =>
                                setTransactionDetails({...transactionDetails, date: e.target.value})
                            }
                            error={formErrors.date}
                            helperText={formErrors.date && 'Please enter a date.'}
                        />
                        <TextField
                            id="standard-number"
                            label="Amount"
                            type="number"
                            fullWidth
                            placeholder="Amount"
                            value={transactionDetails.value}
                            onChange={(e) =>
                                setTransactionDetails({...transactionDetails, value: e.target.value})
                            }
                            error={formErrors.value}
                            helperText={formErrors.value && 'Please enter an amount.'}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            variant="standard"
                        />
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="mt-4 justify-center items-center bg-green-800 hover:bg-green-700 text-white text-xl font-semibold py-2 px-4 rounded-full"
                            >
                                Record Transaction
                            </button>
                        </div>
                    </form>
                </div>
            </Box>
        </Modal>
    );
}

export default Ttracker;
