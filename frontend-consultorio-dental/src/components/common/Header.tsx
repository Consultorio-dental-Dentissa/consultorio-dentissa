import { SidebarTrigger } from "../ui/sidebar";

export interface HeaderProps {
    username: string;
    userRol: string;
}

export function Header({ username, userRol }: HeaderProps) {

    return (
        <div className="h-16 flex items-center bg-white-50 px-5 justify-between">
            <SidebarTrigger className="text-black" />

            <div className="flex-col justify-center">
                <button>{username}</button>
                <p className="text-gray-500 text-xs">{ userRol.toLocaleLowerCase() }</p>
            </div>
        </div>
    );
}