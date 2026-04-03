"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

import AuthLeftPanel from "@/app/components/auth/AuthLeftPanel";
import GoogleButton from "@/app/components/auth/GoogleButton";
import AuthDivider from "@/app/components/auth/AuthDivider";
import AuthFooter from "@/app/components/auth/AuthFooter";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.access_token) {
                localStorage.setItem("access_token", data.access_token);
                router.push("/dashboard");
            }
        } catch (err) {
            console.error(err);
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
                    <span className="text-base-content text-2xl font-display">
                        Épilogue
                    </span>
                </div>

                <div className="w-full max-w-sm flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-2">
                        <h2 className="text-base-content text-3xl font-extrabold text-center">
                            Bienvenue
                        </h2>
                        <p className="text-neutral text-base text-center">
                            Connectez-vous pour booster votre SEO dès maintenant.
                        </p>
                    </div>

                    <div className="flex p-1 bg-base-400 rounded-lg">
                        <div className="flex-1 px-4 py-2 bg-base-100 rounded-md flex justify-center items-center shadow-sm">
                          <span className="text-base-content text-sm font-semibold">
                            Se connecter
                          </span>
                        </div>
                        <Link
                            href="/register"
                            className="flex-1 px-4 py-2 flex justify-center items-center"
                        >
                          <span className="text-neutral text-sm font-medium hover:text-base-content transition-colors">
                            S&apos;inscrire
                          </span>
                        </Link>
                    </div>

                    <GoogleButton apiUrl={process.env.NEXT_PUBLIC_API_URL!} />

                    <AuthDivider />

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-base-content text-sm font-bold">
                                E-mail professionnel
                            </label>
                            <input
                                type="email"
                                placeholder="nom@entreprise.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="w-full h-12 px-4 bg-base-100 border border-base-300 rounded-lg text-base-content placeholder:text-neutral focus:outline-none focus:border-base-content transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-base-content text-sm font-bold">
                                    Mot de passe
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-base-content text-xs hover:underline"
                                >
                                    Oublié ?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    className="w-full h-12 px-4 pr-12 bg-base-100 border border-base-300 rounded-lg text-base-content placeholder:text-neutral focus:outline-none focus:border-base-content transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral hover:text-base-content transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border border-base-300 accent-base-content"
                            />
                            <span className="text-base-content text-base">
                                Se souvenir de moi
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-base-content text-white rounded-lg flex justify-center items-center gap-2 font-semibold text-base hover:bg-base-content/90 transition-colors disabled:opacity-60 cursor-pointer"
                        >
                            {isLoading ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <AuthFooter />
                </div>
            </div>
        </div>
    );
}