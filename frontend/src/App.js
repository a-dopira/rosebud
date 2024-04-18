import { Navigate, useRoutes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Homepage from "./pages/Homepage";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import PrivateRouter from "./utils/PrivateRouter";


function App() {
  const routes = useRoutes([
    { 
      path: 'home/*',
      element: 
      <DataProvider>
        <PrivateRouter>
          <Homepage/>
        </PrivateRouter>
      </DataProvider> },
    { path: 'login/*', element: <LoginPage/> },
    { path: 'register/*', element: <RegisterPage/> },
    { path: '/', element: <Navigate to="/login" replace /> },
  ]);

  return (
    <div className="bg-umbra pattern-dots pattern-white pattern-bg-umbra pattern-size-6
    pattern-opacity-100 min-h-screen flex items-center justify-center font-hedwig">
      <div className="bg-white rounded-large lg:w-2/3 md:w-full mx-auto my-auto p-12 shadow-1xl">
        <AuthProvider>
          {routes}
        </AuthProvider>
      </div>
    </div>  
  );
}

export default App;
