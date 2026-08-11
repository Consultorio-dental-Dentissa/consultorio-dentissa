import { LoginForm } from "@/features/auth/components/LoginForm.component";


export default function LoginPage() {

    return (
        <div className="flex bg-gray-50 justify-center mt-10 items-center h-full">
            <div className="bg-white w-[30%] p-10 shadow-card">
                <LoginForm />
            </div>
        </div>
    );
}