import { Card } from '../components';

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-8.5rem)] max-w-md items-center px-4 py-18">
      <Card className="w-full" padding="p-8 sm:p-10">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-600">Welcome to SkillSwap</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">Learn from one another.</h1>
        <p className="mt-3 leading-7 text-muted">Sign in with Google to find people who share your curiosity.</p>

        <a
          href="/auth/google"
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.8 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.5a4.7 4.7 0 0 1-2.04 3.08v2.51h3.23c1.89-1.74 3.11-4.31 3.11-7.42Z" />
            <path fill="#34A853" d="M12 22c2.76 0 5.08-.91 6.69-2.35l-3.23-2.51c-.9.6-2.05.96-3.46.96-2.66 0-4.92-1.8-5.72-4.22H2.94v2.59A10.1 10.1 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.28 13.88A6.08 6.08 0 0 1 5.96 12c0-.65.11-1.27.32-1.88V7.53H2.94A10 10 0 0 0 1.9 12c0 1.61.39 3.14 1.04 4.47l3.34-2.59Z" />
            <path fill="#EA4335" d="M12 5.9c1.53 0 2.9.53 3.98 1.55l2.99-2.99C17.07 2.69 14.76 1.6 12 1.6a10.1 10.1 0 0 0-9.06 5.93l3.34 2.59C7.08 7.7 9.34 5.9 12 5.9Z" />
          </svg>
          Continue with Google
        </a>

        <p className="mt-6 text-center text-xs leading-5 text-muted">By continuing, you agree to share the basic profile information required to use SkillSwap.</p>
      </Card>
    </section>
  );
}
