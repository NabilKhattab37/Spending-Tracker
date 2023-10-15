'use client'
import React, {useEffect, useState} from 'react';
import {Box, Button, IconButton, InputLabel, Modal, TextField, Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Papa from 'papaparse';

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
            <ul className="list-disc mt-4">
                {sortedTransactions.map((transaction, index) => (
                    <li key={index} className="mb-4 p-4 border rounded-lg flex justify-between items-center">
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
                                    onClick={() => onDeleteTransaction(transactions.indexOf(transaction))}
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

    useEffect(() => {
        // Check if localStorage is available (in a browser context)
        if (typeof window !== 'undefined') {
            // Retrieve transaction data from localStorage
            const localStorageData = localStorage.getItem('transactions');
            const parsedData = localStorageData ? JSON.parse(localStorageData) : [];
            setTransactions(parsedData);
        }
    }, []); // Run this effect once when the component mounts
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
        setBalanceThreshold(0);

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
            const updatedTransactions = [...transactions, {...details, type: transactionType}];
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

    const handleCSV = (event, action) => {
        if (action === 'upload') {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const fileContent = e.target.result;

                    // Parse the CSV data using PapaParse
                    Papa.parse(fileContent, {
                        header: true, // Assumes the first row contains headers
                        dynamicTyping: true, // Automatically convert numeric values
                        complete: (results) => {
                            // Extract the parsed data from the results object
                            const parsedData = results.data;

                            // Update the transactions state with the parsed data
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
            // Convert the transaction history to CSV format
            const csvData = transactions.map((transaction) => ({
                Name: transaction.name,
                Category: transaction.category,
                Date: transaction.date,
                Type: transaction.type,
                Value: transaction.value,
            }));

            // Convert the data to CSV format using papaparse
            const csvContent = Papa.unparse(csvData);

            // Create a Blob with the CSV data
            const blob = new Blob([csvContent], {type: 'text/csv'});

            // Create a temporary URL to the Blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary anchor element for the download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transaction_history.csv';

            // Trigger the click event on the anchor element to start the download
            a.click();

            // Clean up by revoking the URL and removing the anchor element
            window.URL.revokeObjectURL(url);
            a.remove();
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

    const [showAlert, setShowAlert] = useState(false);
    let initialThreshold = '0';
    if (typeof window !== 'undefined') {
        initialThreshold = localStorage.getItem('balanceThreshold') || '0';
    }
    const [balanceThreshold, setBalanceThreshold] = useState(initialThreshold);

    useEffect(() => {
        const threshold = parseFloat(balanceThreshold);
        if (currentBudget < threshold) {
            setShowAlert(true);
        } else {
            setShowAlert(false);
        }
        // Save to localStorage if available
        if (typeof window !== 'undefined') {
            localStorage.setItem('balanceThreshold', balanceThreshold);
        }
    }, [currentBudget, balanceThreshold]);

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 h-auto p-4 rounded-xl justify-center text-center">
                {showAlert && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <strong className="font-bold">Alert!</strong>
                        <span className="block sm:inline">Your balance has fallen below the threshold.</span>
                    </div>
                )}
                <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">Transaction Tracker</h1>
                <input
                    type="number"
                    value={balanceThreshold}
                    onChange={(e) => setBalanceThreshold(parseInt(e.target.value))}
                    className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md p-3 mb-4"
                    placeholder="Enter balance threshold"
                />
                <h2
                    className={`text-xl mb-4 ${currentBudget < parseFloat(balanceThreshold) ? 'text-red-500' : 'text-gray-800'} dark:text-white`}
                >
                    Balance Threshold: ${balanceThreshold}
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
                            <div className="flex mt-4 items-center justify-center">
                                <Button onClick={() => handleTransactionRecording('Revenue')} variant="outlined"
                                        className="me-4 mt-4 border rounded-md">Revenue</Button>
                                <Button onClick={() => handleTransactionRecording('Expense')} variant="outlined"
                                        className="me-4 mt-4 border rounded-md">Expense</Button>
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
                    <div className="relative " dir="rtl">
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
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            className="mt-4 text-white text-xl bg-green-800 hover:bg-green-700"
                        >
                            Record Transaction
                        </Button>
                    </form>
                </div>
            </Box>
        </Modal>
    );
}

export default Ttracker;
