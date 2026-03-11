import { LoginForm } from "@/components/layout/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-emerald-100" />
      <div className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-sky-300/25 blur-3xl" />
      <div className="absolute -right-16 bottom-16 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Mi Restaurante OS</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Service control in real time</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
