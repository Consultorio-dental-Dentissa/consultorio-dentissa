import { SidebarTrigger } from "../ui/sidebar";

export interface HeaderProps {
    username: string;
    userRol: string;
}

export function Header({ username, userRol }: HeaderProps) {

    return (
        <div className="h-16 bg-gray-100 border-b px-5 flex flex-row items-center justify-between">
            <SidebarTrigger className="text-black" />

            <div className="flex-col justify-center">
                <button className="text-black">{username}</button>
                <p className="text-gray-500 text-xs">{userRol}</p>
            </div>
        </div>
    );
}