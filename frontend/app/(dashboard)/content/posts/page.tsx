import Link from "next/link";
import {Plus} from "lucide-react";
import PostsTable from "@/app/(dashboard)/content/posts/table";

export default function PostsPage() {
    return (
        <div className="flex flex-col gap-6 max-w-full">

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-display">Mes posts</h1>
                <Link className="btn btn-accent btn-sm gap-2 rounded-full px-4" href="/content/writing">
                    <Plus size={15}/>
                    Nouveau post
                </Link>
            </div>

            <div className="card bg-base-100 border border-base-300 shadow-xs">
                <div className="card-body p-0">
                    <PostsTable/>
                </div>
            </div>
        </div>
    );
}