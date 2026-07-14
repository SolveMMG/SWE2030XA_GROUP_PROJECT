import { PageShell } from './layouts';
import { AppRoutes } from './routes';

function App() {
  const isAuthenticated = Boolean(localStorage.getItem('skillswap_token'));

  return (
    <PageShell isAuthenticated={isAuthenticated}>
      <AppRoutes isAuthenticated={isAuthenticated} />
    </PageShell>
  );
}

export default App;
