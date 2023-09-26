import React, { useEffect, useState } from 'react';
import Budget from "@/app/(Pages)/Dashboard/Budget";

function Page() {
    // State to hold the displayed budget
    const [displayedBudget, setDisplayedBudget] = useState(0); // Initialize with 0

    // Function to update the displayed budget
    const updateDisplayedBudget = () => {
        const savedBudget = localStorage.getItem('budget');
        if (savedBudget) {
            setDisplayedBudget(parseFloat(savedBudget)); // Parse the budget value
        }
    };

    // Function to update the budget when a transaction is recorded
    const onTransactionRecord = (newBudget) => {
        setDisplayedBudget(newBudget);
    };

    // Retrieve the budget value from localStorage on component mount
    useEffect(() => {
        updateDisplayedBudget();

        // Listen for the storage event to update the displayed budget
        window.addEventListener('budgetUpdated', updateDisplayedBudget);

        return () => {
            // Remove the event listener when the component unmounts
            window.removeEventListener('budgetUpdated', updateDisplayedBudget);
        };
    }, []);

    return (
        <section>
            <Budget
                currentBudget={displayedBudget} // Pass displayedBudget directly
                onTransactionRecord={onTransactionRecord}
            />
            <div>
                <p>Current Budget: ${displayedBudget}</p>
            </div>
        </section>
    );
}

export default Page;
