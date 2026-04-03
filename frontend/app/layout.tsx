import type {Metadata} from "next";
import {Rubik} from "next/font/google";
import "./globals.css";

const rubik = Rubik({
    variable: "--font-rubik",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Épilogue",
    description: "Votre outil de gestion de contenus SEO",
};

export default function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" data-theme="epilogue" className={rubik.variable} suppressHydrationWarning>
        <body className="min-h-full">{children}</body>
        </html>
    );
}
