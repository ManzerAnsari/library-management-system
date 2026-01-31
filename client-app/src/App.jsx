import { Suspense } from 'react';
import { BrowserRouter, useRoutes, Navigate } from 'react-router-dom';
import { buildRoutes } from './config/routes';
import './App.css';

function RouteRenderer() {
  const routes = useRoutes([
    ...buildRoutes(),
    { path: '*', element: <Navigate to="/" replace /> },
  ]);
  return routes;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>}>
        <RouteRenderer />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
