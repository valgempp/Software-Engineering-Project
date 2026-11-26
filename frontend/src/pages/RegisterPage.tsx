import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          email,
          username,
          password,
          privacyAccepted,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as {
          error?: string;
          details?: { message: string }[];
        };

        setError(
          data.details?.[0]?.message ?? data.error ?? 'Registration failed',
        );
        return;
      }

      void navigate('/');
    } catch {
      setError('Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">Create an account</h1>

      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="space-y-4"
      >
        <label className="block">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 p-2"
          />
        </label>

        <label className="block">
          Username
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 p-2"
          />
        </label>

        <label className="block">
          Password
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            className="mt-1 w-full rounded-md border border-slate-300 p-2"
          />
          <span className="text-sm text-slate-500">At least 8 characters</span>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            required
          />
          I accept the privacy policy
        </label>

        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 underline"
        >
          Read the privacy policy
        </a>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 p-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </section>
  );
}
