export default function Card({ children, className = '', padding = 'p-6', ...props }) {
  return (
    <section {...props} className={`rounded-2xl bg-surface shadow-card ${padding} ${className}`}>
      {children}
    </section>
  );
}
