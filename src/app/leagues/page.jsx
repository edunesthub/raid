"use client";

import React from 'react';
import LeagueSection from '@/components/LeagueSection';

export default function LeaguesPage() {
    return (
        <div className="container-mobile py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Global Leagues</h1>
                <p className="text-gray-400">
                    Track standings, point differences, and upcoming playoff qualifications across all divisions.
                </p>
            </div>

            <LeagueSection />
        </div>
    );
}
