'use client';

import { loginAdmin } from '@/actions/auth/admin';

export default function LoginForm() {
  return (
    <form action={async (formData) => {
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
  );
}
