import { Navigate, useLocation, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Homepage from './pages/Homepage';
import { DataProvider } from './context/DataContext';
import { useContext, Suspense } from 'react';
import AuthContext from './context/AuthContext';
import Loader from './utils/Loaders/Loader';

function App() {
  const { user, authLoading } = useContext(AuthContext);
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  if (authLoading) {
    return null;
  }

  return (
    <>
      <Loader />
      <div
        className="bg-umbra pattern-dots pattern-white pattern-bg-umbra 
                        pattern-size-6 pattern-opacity-100 min-h-screen flex 
                        items-center justify-center font-hedwig"
      >
        <div
          className={`bg-white w-full md:w-3/4 max-w-7xl mx-auto 
                      md:my-8 sm:my-6 sm:rounded-large sm:p-12 px-0 
                      sm:shadow-1xl ${isAuthPage ? 'min-h-0' : 'min-h-[700px]'}`}
        >
          <Routes>
            <Route
              path="/home/*"
              element={
                user ? (
                  <Suspense fallback={<Loader />}>
                    <DataProvider>
                      <Homepage />
                    </DataProvider>
                  </Suspense>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/home" replace /> : <LoginPage />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/home" replace /> : <RegisterPage />}
            />
            <Route
              path="/"
              element={<Navigate to={user ? '/home' : '/login'} replace />}
            />
            <Route
              path="*"
              element={<Navigate to={user ? '/home' : '/login'} replace />}
            />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
