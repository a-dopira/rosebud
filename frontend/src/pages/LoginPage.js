import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"
import { useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import { motion } from 'framer-motion';
import * as yup from 'yup'

import AuthContext from "../context/AuthContext"


const schema = yup.object().shape({
  email: yup.string().required('Почта обязательна для заполнения'),
  password: yup.string().required('Пароль обязателен для заполнения'),
});

function LoginPage() {
  const { checkAuth,isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loginErrors, setLoginError] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const login = async (email, password) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        await checkAuth();
        return true;
      } else {
        setLoginError("Неверный логин или пароль");
        return false;
      }
    } catch (error) {
      console.error("Ошибка при логине:", error);
      setLoginError("Ошибка соединения с сервером");
      return false;
    }
  };

  const onSubmit = async (data) => {
    const success = await login(data.email, data.password);
    if (success) {
      navigate('/home');
    } else {
      alert('Неверный логин или пароль');
    }
  }

    return (
      <>
      <Helmet>
        <title>Добро пожаловать!</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="min-h-max mx-auto">
          <form className="max-w-sm mx-auto" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-5">
              <label htmlFor="email" className="block mb-2 text-3xl font-medium text-gray-900">Почта</label>
              <input 
                {...register('email')} 
                id="email"
                type="email"
                placeholder="Почта" 
                className={`border-2 text-2xl p-2 rounded-md w-full ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
              />
              {errors.email && <div className='text-red-900'>{errors.email.message}</div>}
            </div>

            <div className="mb-5">
              <label htmlFor="password" className="block mb-2 text-3xl font-medium text-gray-900">Пароль</label>
              <input 
                {...register('password')} 
                id="password" 
                // type="password" 
                placeholder="Пароль" 
                className={`border-2 text-2xl p-2 rounded-md w-full ${errors.password ? 'border-red-500' : 'border-gray-300'}`} 
              />
              {errors.password && <div className='text-red-900'>{errors.password.message}</div>}
              {loginErrors ? <div className='text-red-900'>Неверные почта или пароль</div> : null}
            </div>

            <div className="flex items-center justify-center">
              <button type="submit" className="mr-5 w-36 btn-red text-2xl bg-dotted-spacing-3.5 bg-dotted-gray-200 bg-dotted-radius-[1.5px]">
                Войти
              </button>
              <button type="button" onClick={() => navigate('/register')} className="w-60 py-1.5 btn-amber text-2xl bg-dotted-spacing-3.5 bg-dotted-gray-200 bg-dotted-radius-[1.5px]">
                Зарегистрироваться
              </button>
            </div>
          </form>
        </div>
      </motion.div>
      </>
    )
}

export default LoginPage
