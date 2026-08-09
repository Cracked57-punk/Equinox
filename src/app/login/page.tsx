import { LoginForm } from '@/components/team/LoginForm';

export const metadata = {
  title: 'Team Login | Equinox',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black text-white">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Equinox Portal
        </h1>
        <p className="text-gray-400">Round 2 Team Login</p>
      </div>

      <LoginForm />
    </div>
  );
}
