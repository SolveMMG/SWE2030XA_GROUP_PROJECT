import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} SkillSwap. Learn, share, grow.</p>
        <div className="flex gap-5">
          <Link className="hover:text-brand-700" to="/explore">Explore</Link>
          <Link className="hover:text-brand-700" to="/login">Join SkillSwap</Link>
        </div>
      </div>
    </footer>
  );
}
