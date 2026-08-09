import { loginAdmin } from '@/actions/auth';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Admin Login</h2>
          <p className="text-sm text-gray-500 mt-2">Sign in to the admin dashboard.</p>
        </div>

        <form action={async (formData) => {
          'use server';
          const email = formData.get('email') as string;
          const password = formData.get('password') as string;
          await loginAdmin(email, password);
        }} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border p-2"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border p-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-black py-2 text-white hover:bg-gray-800"
          >
            Sign In
          </button>
        </form>

        <div className="text-center text-sm">
          <a href="/admin/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}
