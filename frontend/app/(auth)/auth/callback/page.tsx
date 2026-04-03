"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
            router.push("/login?error=" + error);
            return;
        }

        if (token) {
            localStorage.setItem("access_token", token);
            router.push("/dashboard");
        } else {
            router.push("/login");
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <span className="loading loading-spinner loading-lg text-base-content" />
                <p className="text-neutral text-sm">
                    Connexion en cours...
                </p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense>
            <AuthCallbackContent />
        </Suspense>
    );
}