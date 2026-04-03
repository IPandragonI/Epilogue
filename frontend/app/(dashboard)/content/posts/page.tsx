import Link from "next/link";
import {ArrowUpDown, MoreHorizontal, ChevronLeft, ChevronRight, Plus} from "lucide-react";
import {Content, Status} from "@/app/types/types";
import StatusBadge from "@/app/components/content/StatusBadge";
import ScoreBar from "@/app/components/content/ScoreBar";

const CONTENTS: Content[] = [
    {
        id: 1,
        title: "Guide SEO 2026 : Les tendances majeures",
        date: "1/11/2050",
        seo: {score: 92},
        status: Status.PUBLISHED
    },
    {id: 2, title: "Stratégie content marketing B2B", date: "1/11/2050", seo: {score: 57}, status: Status.PUBLISHED},
    {
        id: 3,
        title: "Top outils IA pour copywriting en 2026",
        date: "1/11/2050",
        seo: {score: 86},
        status: Status.DRAFT
    },
    {
        id: 4,
        title: "Comment optimiser son site pour Google SGE",
        date: "1/11/2050",
        seo: {score: 24},
        status: Status.DRAFT
    },
    {
        id: 5,
        title: "Les 10 erreurs à ne pas commettre en SEO",
        date: "1/11/2050",
        seo: {score: 58},
        status: Status.PUBLISHED
    },
    {
        id: 6,
        title: "Mes blogs SEO préférés à suivre en 2026",
        date: "1/11/2050",
        seo: {score: 88},
        status: Status.DRAFT
    },
];

export default function PostsPage() {
    return (
        <div className="flex flex-col gap-6 max-w-full">

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-display">Mes posts</h1>
                <button className="btn btn-accent btn-sm gap-2 rounded-full px-4">
                    <Plus size={15}/>
                    Nouveau post
                </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <div className="join">
                    {(["Tous", Status.PUBLISHED, Status.DRAFT] as const).map((f, i) => (
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
                    <input type="text" placeholder="Rechercher un content..." className="grow text-sm"/>
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
                                    <th className="font-medium">Status</th>
                                    <th/>
                                </tr>
                            </thead>
                            <tbody>
                            {CONTENTS.map((content) => (
                                <tr key={content.id} className="border-base-300 hover:bg-base-200 transition-colors cursor-pointer">
                                    <td className="pl-6">
                                        <Link href={`/content/posts/${content.id}`}
                                            className="font-medium text-sm hover:underline underline-offset-2 line-clamp-1 max-w-xs block"
                                        >
                                            {content.title}
                                        </Link>
                                    </td>
                                    <td className="text-sm text-base-content/50">{content.date}</td>
                                    <td><ScoreBar score={content.seo?.score ?? 0}/></td>
                                    <td><StatusBadge status={content.status}/></td>
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