import { Button, Card } from '../components';

export default function NotFoundPage() {
  return <section className="mx-auto max-w-lg px-4 py-18"><Card className="text-center"><p className="text-sm font-bold text-brand-600">404</p><h1 className="mt-2 font-display text-3xl font-bold">Page not found</h1><Button className="mt-6" to="/">Go home</Button></Card></section>;
}
