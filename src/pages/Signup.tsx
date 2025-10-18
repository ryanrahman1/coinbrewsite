import { SignupForm } from "@/components/signup-form"
export default function SignupPage() {
  return (
    <div className="bg-black flex min-h-svh flex-col items-center justify-center p-6 md:p-10 dark">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  )
}
