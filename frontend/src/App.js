import { Navigate, useRoutes, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Homepage from './pages/Homepage';
import { DataProvider } from './context/DataContext';
import PrivateRouter from './utils/PrivateRouter';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import useRosebud from './hooks/useRosebud';
import Loader from './utils/Loaders/Loader';

function App() {
  const { authLoading } = useContext(AuthContext);
  const { loading } = useRosebud();

  const location = useLocation();

  const routes = useRoutes([
    {
      path: '/*',
      element: (
        <DataProvider>
          <PrivateRouter>
            <Homepage />
          </PrivateRouter>
        </DataProvider>
      ),
    },
    { path: 'login/*', element: <LoginPage /> },
    { path: 'register/*', element: <RegisterPage /> },
    { path: '/', element: <Navigate to="/login" replace /> },
  ]);

  const isAuthPage =
    location.pathname.includes('/login') || location.pathname.includes('/register');

  if (authLoading || loading) {
    return <Loader />;
  }

  return (
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
        {routes}
      </div>
    </div>
  );
}

export default App;
