import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { IconType } from "react-icons/lib"


export interface CardDashboardProps {
    title: string;
    icon: IconType;
    data: string;
}

export function CardDashboard({ title, icon: Icon, data }: CardDashboardProps) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex flex-row items-center gap-2">
                    <Icon className="w-4 h-4 text-zinc-500" />
                    <p className="text-xs text-zinc-500 font-semibold">{ title }</p>
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="text-3xl font-bold">
                    { data }
                </div>
            </CardContent>
        </Card>
    )
}