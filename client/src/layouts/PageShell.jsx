import Footer from './Footer';
import Navbar from './Navbar';

export default function PageShell({ children, ...navbarProps }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar {...navbarProps} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
