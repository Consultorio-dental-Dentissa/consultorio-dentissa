import { SidebarTrigger } from "../ui/sidebar";
import { useAuth } from "@/features/auth/context/auth-context-provider";
import { formatFirstLetterUppercase } from "@/utils/formatters";

export function Header() {

    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const username = `${user.name} ${user.lastname}`;
    const userRole = user ? formatFirstLetterUppercase(user.role) : '';
    
    return (
        <div className="sticky top-0 shrink-0 backdrop-blur-xl py-5 h-16 bg-neutral-300/30 border-b px-5 flex flex-row items-center justify-between z-50">
            <SidebarTrigger className="text-black" />

            <div className="flex-col justify-center">
                <button className="text-black">{ username }</button>
                <p className="text-gray-500 text-xs">{ userRole }</p>
            </div>
        </div>
    );
}