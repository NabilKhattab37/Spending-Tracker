'use client'
import React, { useEffect, useState } from 'react';
import Budget from "@/app/(Pages)/Dashboard/Budget";

function Page() {
    // State to hold the displayed budget
    const [displayedBudget, setDisplayedBudget] = useState('');

    // Function to update the displayed budget
    const updateDisplayedBudget = () => {
        const savedBudget = localStorage.getItem('budget');
        if (savedBudget) {
            setDisplayedBudget(savedBudget);
        }
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
            <Budget />
            <div>
                <p>Current Budget: ${displayedBudget}</p>
            </div>
        </section>
    );
}

export default Page;
