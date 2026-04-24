import { Outlet } from 'react-router-dom';
import Navigation from '../../components/Navigation/Navigation';
import Toast from '../../components/Toast/Toast';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navigation />
      <main id="main-content" className="app-layout__main">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
