"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const TeamCreator = dynamic(() => import("../components/TeamCreator"), { ssr: false });

export default function TeamManagerDashboard() {
    const [managerEmail, setManagerEmail] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const email = localStorage.getItem("managerEmail");
        if (!email) {
            router.push("/team-manager/login");
        } else {
            setManagerEmail(email);
        }
    }, [router]);

    if (!managerEmail) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <TeamCreator managerEmail={managerEmail} />;
}
