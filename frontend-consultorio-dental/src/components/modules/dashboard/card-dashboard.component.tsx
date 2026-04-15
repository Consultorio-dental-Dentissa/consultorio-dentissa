import type { ReactNode } from "react"

export interface CardDashboardProps {
    children: ReactNode;
    title: string;
    url: string;
    backgroundColor: string;
}

export function CardDashboard({ title, children, url, backgroundColor }: CardDashboardProps) {
    return (
        <>
            <a href={ url } className={`${backgroundColor} px-5 py-5 w-full rounded-xl flex flex-col items-center gap-2 transition transform duration-300 hover:scale-105 active:scale-95`}>
                <div className="text-2xl text-white"> { children } </div>
                <div className="text-white font-bold"> { title } </div>
            </a>
        </>
    )
}