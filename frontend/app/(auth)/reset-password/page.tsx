"use client";

import {Suspense, useEffect, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole} from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";

import AuthLeftPanel from "@/app/components/auth/AuthLeftPanel";
import AuthFooter from "@/app/components/auth/AuthFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordForm />
        </Suspense>
    );
}

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError("Le lien de réinitialisation est invalide.");
                setValidating(false);
                return;
            }

            try {
                setValidating(true);
                setError(null);

                const res = await fetch(`${API_URL}/auth/reset-password/validate?token=${encodeURIComponent(token)}`);
                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error(data?.message || "Le lien de réinitialisation est invalide ou expiré.");
                }

                setIsTokenValid(true);
            } catch (err: unknown) {
                setIsTokenValid(false);
                setError(err instanceof Error ? err.message : "Le lien de réinitialisation est invalide ou expiré.");
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            setSuccess(null);

            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({token, password}),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Impossible de réinitialiser le mot de passe.");
            }

            setSuccess(data?.message || "Votre mot de passe a été réinitialisé avec succès.");
            setTimeout(() => router.push("/login"), 1200);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <AuthLeftPanel />

            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-base-100 min-h-screen">
                <div className="lg:hidden flex items-center gap-2 mb-8">
                    <Image src="/logo.png" alt="Logo" width={32} height={32}/>
                    <span className="text-base-content text-2xl font-display">Épilogue</span>
                </div>

                <div className="w-full max-w-sm flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center text-base-content">
                            <LockKeyhole size={22}/>
                        </div>
                        <h2 className="text-base-content text-3xl font-extrabold">
                            Nouveau mot de passe
                        </h2>
                        <p className="text-neutral text-base">
                            Choisissez un nouveau mot de passe pour accéder à votre compte.
                        </p>
                    </div>

                    {validating ? (
                        <div className="w-full p-4 rounded-lg bg-base-200 text-sm text-base-content/70 flex items-center justify-center gap-2">
                            <span className="loading loading-spinner loading-sm"/>
                            Vérification du lien...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {error && (
                                <div className="w-full p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="w-full p-3 rounded-lg bg-green-500/10 border border-green-500 text-green-600 text-sm">
                                    {success}
                                </div>
                            )}

                            {isTokenValid && (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-base-content text-sm font-bold">
                                            Nouveau mot de passe
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Minimum 8 caractères"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={8}
                                                className="w-full h-12 px-4 pr-12 bg-base-100 border border-base-300 rounded-lg text-base-content placeholder:text-neutral focus:outline-none focus:border-base-content transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((value) => !value)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral hover:text-base-content transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-base-content text-sm font-bold">
                                            Confirmer le mot de passe
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Répétez votre mot de passe"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                minLength={8}
                                                className="w-full h-12 px-4 pr-12 bg-base-100 border border-base-300 rounded-lg text-base-content placeholder:text-neutral focus:outline-none focus:border-base-content transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((value) => !value)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral hover:text-base-content transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-14 bg-base-content text-white rounded-lg flex justify-center items-center gap-2 font-semibold text-base hover:bg-base-content/90 transition-colors disabled:opacity-60 cursor-pointer"
                                    >
                                        {isLoading ? (
                                            <span className="loading loading-spinner loading-sm"/>
                                        ) : (
                                            <>
                                                <span>Réinitialiser mon mot de passe</span>
                                                <ArrowRight className="w-5 h-5"/>
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </form>
                    )}

                    <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-base-content/70 hover:text-base-content transition-colors">
                        <ArrowLeft size={15}/>
                        Retour à la connexion
                    </Link>

                    <AuthFooter />
                </div>
            </div>
        </div>
    );
}
