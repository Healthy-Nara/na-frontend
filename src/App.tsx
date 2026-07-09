import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NALogin from './pages/NALogin';
import NADashboard from './pages/NADashboard';
import NAReportForm from './pages/NAReportForm';
import NAReportDetail from './pages/NAReportDetail';
import NAReportHistory from './pages/NAReportHistory';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = () => {
  const token = localStorage.getItem('na_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<NALogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<NADashboard />} />
            <Route path="/report/:id" element={<NAReportForm />} />
            <Route path="/report/:id/view" element={<NAReportDetail />} />
            <Route path="/reports" element={<NAReportHistory />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
