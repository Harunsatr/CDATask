import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' as Role,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError('Unable to create account.');
    }
  };

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-3xl border border-platinum/60 bg-white/80 p-10">
        <p className="text-xs uppercase tracking-[0.4em] text-charcoal/60">Apply for access</p>
        <h1 className="mt-4 text-3xl font-semibold text-charcoal">Join LuxePortal</h1>
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="text-sm font-semibold text-charcoal" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
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
              minLength={10}
              className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <p className="mt-2 text-xs text-charcoal/60">Minimum 10 characters with upper, lower, number, and symbol.</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-charcoal" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as Role }))}
            >
              <option value="customer">Traveler</option>
              <option value="merchant">Property partner</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full rounded-full bg-charcoal px-6 py-4 text-sm font-semibold text-ivory">
            Request membership
          </button>
        </form>
      </div>
    </section>
  );
}
