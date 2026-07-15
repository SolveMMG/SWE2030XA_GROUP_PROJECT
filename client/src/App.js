import { PageShell } from './layouts';
import { AppRoutes } from './routes';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <PageShell isAuthenticated={isAuthenticated} onLogout={logout} user={user}>
      <AppRoutes />
    </PageShell>
  );
}
export default App;
