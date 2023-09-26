'use client'
import React, { useState } from 'react';
import Budget from "@/app/(Pages)/Dashboard/Budget";

function page({ budget }) {
    return (
        <section>
            <Budget /> {/* Pass the budget as a prop */}
        </section>
    );
}

export default page;
