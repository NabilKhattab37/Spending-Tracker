'use client'
import React, { useEffect, useState } from 'react';
import Budget from "@/app/(Pages)/Dashboard/Budget";

function Page() {

    return (
        <div className="flex min-h-screen flex-col items-center justify-between p-24">
            <Budget />
        </div>

    );
}

export default Page;
