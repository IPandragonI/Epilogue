import Link from "next/link";
import {ArrowUpDown, MoreHorizontal, ChevronLeft, ChevronRight, Plus} from "lucide-react";

type Post = {
    id: number;
    titre: string;
    date: string;
    scoreSeo: number;
    mots: number;
    status: "Publié" | "Brouillon" | "En cours de syncro";
};

const POSTS: Post[] = [
    {
        id: 1,
        titre: "Guide SEO 2026 : Les tendances majeures",
        date: "1/11/2050",
        scoreSeo: 92,
        mots: 345,
        status: "Publié"
    },
    {id: 2, titre: "Stratégie content marketing B2B", date: "1/11/2050", scoreSeo: 57, mots: 210, status: "Publié"},
    {
        id: 3,
        titre: "Top outils IA pour copywriting en 2026",
        date: "1/11/2050",
        scoreSeo: 86,
        mots: 520,
        status: "Brouillon"
    },
    {
        id: 4,
        titre: "Comment optimiser son site pour Google SGE",
        date: "1/11/2050",
        scoreSeo: 24,
        mots: 180,
        status: "En cours de syncro"
    },
    {
        id: 5,
        titre: "Les 10 erreurs à ne pas commettre en SEO",
        date: "1/11/2050",
        scoreSeo: 58,
        mots: 430,
        status: "Publié"
    },
    {
        id: 6,
        titre: "Mes blogs SEO préférés à suivre en 2026",
        date: "1/11/2050",
        scoreSeo: 88,
        mots: 290,
        status: "En cours de syncro"
    },
];

function StatusBadge({status}: { status: Post["status"] }) {
    const styles: Record<Post["status"], string> = {
        "Publié": "badge-success",
        "Brouillon": "badge-warning",
        "En cours de syncro": "badge-info",
    };
    return (
        <span className={`badge badge-soft badge-sm font-medium ${styles[status]}`}>
      {status}
    </span>
    );
}

function ScoreBar({score}: { score: number }) {
    const color = score >= 75 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-error";
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium w-6 text-right">{score}</span>
            <div className="flex-1 h-1.5 bg-base-300 rounded-full overflow-hidden w-16">
                <div className={`h-full rounded-full ${color}`} style={{width: `${score}%`}}/>
            </div>
        </div>
    );
}

export default function MesPostsPage() {
    return (
        <div className="flex flex-col gap-6 max-w-full">

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-display">Mes posts</h1>
                <button className="btn btn-primary btn-sm gap-2 rounded-full px-4">
                    <Plus size={15}/>
                    Nouveau post
                </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <div className="join">
                    {(["Tous", "Publié", "Brouillon", "En cours de syncro"] as const).map((f, i) => (
                        <button
                            key={f}
                            className={`join-item btn btn-sm ${i === 0 ? "btn-active btn-neutral" : "btn-ghost border border-base-300"}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="flex-1"/>
                <label className="input input-bordered input-sm flex items-center gap-2 rounded-full max-w-xs">
                    <input type="text" placeholder="Rechercher un post..." className="grow text-sm"/>
                </label>
            </div>

            <div className="card bg-base-100 border border-base-300 shadow-xs">
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                            <tr className="border-base-300 text-base-content/50 text-xs uppercase tracking-wide">
                                <th className="pl-6 font-medium">Titre</th>
                                <th className="font-medium">
                    <span className="flex items-center gap-1">
                      Date <ArrowUpDown size={12}/>
                    </span>
                                </th>
                                <th className="font-medium">Score SEO</th>
                                <th className="font-medium">Mots</th>
                                <th className="font-medium">Status</th>
                                <th/>
                            </tr>
                            </thead>
                            <tbody>
                            {POSTS.map((post) => (
                                <tr key={post.id} className="border-base-300 hover:bg-base-200 transition-colors cursor-pointer">
                                    <td className="pl-6">
                                        <Link
                                            href={`/contenu/posts/${post.id}`}
                                            className="font-medium text-sm hover:underline underline-offset-2 line-clamp-1 max-w-xs block"
                                        >
                                            {post.titre}
                                        </Link>
                                    </td>
                                    <td className="text-sm text-base-content/50">{post.date}</td>
                                    <td><ScoreBar score={post.scoreSeo}/></td>
                                    <td className="text-sm text-base-content/50">{post.mots}</td>
                                    <td><StatusBadge status={post.status}/></td>
                                    <td>
                                        <div className="dropdown dropdown-end">
                                            <button tabIndex={0} className="btn btn-ghost btn-xs btn-square">
                                                <MoreHorizontal size={14}/>
                                            </button>
                                            <ul tabIndex={0} className="dropdown-content menu menu-sm bg-base-100 border border-base-300 rounded-box shadow-lg w-36 z-10">
                                                <li><a>Voir</a></li>
                                                <li><a>Modifier</a></li>
                                                <li><a>Dupliquer</a></li>
                                                <li className="divider my-0"/>
                                                <li><a className="text-error">Supprimer</a></li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between px-6 py-4 border-t border-base-300">
                        <button className="btn btn-sm btn-outline rounded-full gap-1">
                            <ChevronLeft size={14}/> Prev
                        </button>
                        <div className="join">
                            {[1, 2, 3, 4].map((page) => (
                                <button key={page} className={`join-item btn btn-sm btn-ghost w-8 ${page === 1 ? "btn-active" : ""}`}>
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button className="btn btn-sm btn-outline rounded-full gap-1">
                            Next <ChevronRight size={14}/>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}