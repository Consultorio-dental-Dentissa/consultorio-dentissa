import { SignUpForm } from "@/features/auth/components/SignUpForm.component";


export default function SignUpPage() {

    return (
        <div className="bg-gray-50 flex justify-center">
            <div className="flex flex-col w-[50%] bg-white p-10 shadow-card">
                <SignUpForm />                
            </div>
        </div>
    );
}