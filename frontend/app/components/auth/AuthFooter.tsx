import Link from "next/link";

export default function AuthFooter() {
    return (
        <>
            {/*<p className="text-neutral text-xs text-center leading-5">*/}
            {/*    En continuant, vous acceptez nos{" "}*/}
            {/*    <Link href="/terms" className="text-base-content font-medium hover:underline">*/}
            {/*        Conditions d&apos;utilisation*/}
            {/*    </Link>{" "}*/}
            {/*    et notre{" "}*/}
            {/*    <Link href="/privacy" className="text-base-content font-medium hover:underline">*/}
            {/*        Politique de confidentialité*/}
            {/*    </Link>*/}
            {/*    .*/}
            {/*</p>*/}
            <div className="flex justify-center gap-6">
                {["Aide", "Contact", "Tarifs"].map((item) => (
                    <Link
                        key={item}
                        href="#"
                        className="text-neutral text-xs hover:text-base-content transition-colors"
                    >
                        {item}
                    </Link>
                ))}
            </div>
        </>
    );
}