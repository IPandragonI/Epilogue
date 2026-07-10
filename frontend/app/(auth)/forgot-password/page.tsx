"use client";

import {useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {ArrowLeft, ArrowRight, Mail} from "lucide-react";

import AuthLeftPanel from "@/app/components/auth/AuthLeftPanel";
import AuthFooter from "@/app/components/auth/AuthFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Impossible d'envoyer le lien de réinitialisation.");
            }

            setSuccess(data?.message || "Si un compte existe avec cet email, un lien a été envoyé.");
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
                            <Mail size={22}/>
                        </div>
                        <h2 className="text-base-content text-3xl font-extrabold">
                            Mot de passe oublié
                        </h2>
                        <p className="text-neutral text-base">
                            Saisissez votre email pour recevoir un lien de réinitialisation.
                        </p>
                    </div>

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

                        <div className="flex flex-col gap-2">
                            <label className="text-base-content text-sm font-bold">
                                E-mail professionnel
                            </label>
                            <input
                                type="email"
                                placeholder="nom@entreprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-12 px-4 bg-base-100 border border-base-300 rounded-lg text-base-content placeholder:text-neutral focus:outline-none focus:border-base-content transition-colors"
                            />
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
                                    <span>Envoyer le lien</span>
                                    <ArrowRight className="w-5 h-5"/>
                                </>
                            )}
                        </button>
                    </form>

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
