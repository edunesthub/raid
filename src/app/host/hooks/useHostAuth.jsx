"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function useHostAuth() {
    const [host, setHost] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    const userData = userDoc.data();

                    if (userData && userData.role === "host") {
                        if (userData.status === 'approved') {
                            setHost({
                                id: user.uid,
                                ...userData
                            });
                        } else {
                            console.warn("Host is not approved", userData.status);
                            setHost(null);
                            // Sign out the user if they are not approved
                            await signOut(auth);
                            // Redirect to login with error
                            router.replace('/host/login?error=' + (userData.status === 'terminated' ? 'account_terminated' : 'account_pending'));
                        }
                    } else {
                        console.warn("User is not a host", userData);
                        setHost(null);
                        // Redirect if not on login/signup pages
                        if (!window.location.pathname.includes('/host/login') && !window.location.pathname.includes('/host/signup')) {
                            router.replace('/host/login');
                        }
                    }
                } catch (error) {
                    console.error("Error fetching host data:", error);
                    setHost(null);
                }
            } else {
                setHost(null);
                if (!window.location.pathname.includes('/host/login') && !window.location.pathname.includes('/host/signup')) {
                    router.replace('/host/login');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const logout = async () => {
        try {
            await signOut(auth);
            setHost(null);
            router.replace('/host/login');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return { host, loading, logout };
}
