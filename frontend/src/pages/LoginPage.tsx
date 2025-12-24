import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getRedirectPath = (user: User) => {
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'merchant':
        return '/merchant';
      default:
        return '/dashboard';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(form);
      navigate(getRedirectPath(user));
    } catch (err) {
      setError('Unable to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-3xl border border-platinum/60 bg-white/80 p-10">
        <p className="text-xs uppercase tracking-[0.4em] text-charcoal/60">Secure access</p>
        <h1 className="mt-4 text-3xl font-semibold text-charcoal">Welcome back</h1>
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="text-sm font-semibold text-charcoal" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-charcoal" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-full bg-charcoal px-6 py-4 text-sm font-semibold text-ivory disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </section>
  );
}
