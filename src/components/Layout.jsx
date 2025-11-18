// components/Layout.jsx
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar-modern">
        <Sidebar />
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}