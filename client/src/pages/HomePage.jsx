import { Button, Card } from '../components';

export default function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
      <Card className="max-w-2xl" padding="p-8 sm:p-12">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-600">Skill-sharing community</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">Trade knowledge. Grow together.</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted">SkillSwap connects people who want to teach what they know and learn something new.</p>
        <Button className="mt-8" to="/login" size="lg">Join SkillSwap</Button>
      </Card>
    </section>
  );
}
