import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import Link from "next/link";
import PostTable from "../content/posts/table";
import StatCards from "@/app/components/content/StatCards"

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

    if (!token) redirect("/login");

    return (
        <div className="flex flex-col gap-6 max-w-full">
            <StatCards />

            <div className="card bg-base-100 shadow-xs border border-base-300">
                <div className="card-body p-0">
                    <div className="flex items-center justify-between px-6 pt-5 pb-4">
                        <h2 className="text-lg font-bold font-display">Contenus récents</h2>
                        <div className="flex items-center gap-2">
                            <Link href="/content/posts" className="btn btn-sm btn-outline rounded-full px-4">
                                Voir tout
                            </Link>
                        </div>
                    </div>

                    <PostTable/>
                </div>
            </div>

        </div>
    );
}