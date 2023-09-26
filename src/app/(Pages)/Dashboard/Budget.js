import React, { useState, useEffect } from 'react';
import {Box, Button, Modal, Typography} from "@mui/material";

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
                            <Button onClick={handleOpen} type="Revenue" variant="outlined" className="me-4 mt-4 border rounded-md">Revenue</Button>
                            <Button onClick={handleOpen} variant="outlined" type="Expense" className="me-4 mt-4 border rounded-md">Expense</Button>
                        </div>
                    </Box>
                </Modal>
            </form>
        </div>
    );
}

export default Budget;
