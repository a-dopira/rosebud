import { useContext, useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"
import { useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import AuthContext from "../context/AuthContext"


const schema = yup.object().shape({
  email: yup.string().required('Почта обязательна для заполнения'),
  password: yup.string().required('Пароль обязателен для заполнения'),
});

function LoginPage() {
  const { checkAuth, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loginErrors, setLoginError] = useState(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // Используем useRef для отслеживания монтирования
  const isMounted = useRef(false);

  // Оптимизируем проверку авторизации
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      if (user) {
        requestAnimationFrame(() => {
          navigate('/home');
        });
      }
    }
  }, [user, navigate]);

  // Оптимизируем login запрос
  const login = useCallback(async (email, password) => {
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
      setLoginError("Ошибка соединения с сервером");
      return false;
    }
  }, [checkAuth]);

  // Оптимизируем обработчик отправки формы
  const onSubmit = useCallback(async (data) => {
    const success = await login(data.email, data.password);
    if (success) {
      requestAnimationFrame(() => {
        navigate('/home');
      });
    }
  }, [login, navigate]);

  return (
    <>
      <Helmet>
        <title>{'Добро пожаловать!'}</title>
      </Helmet>
      <div className="px-8 min-h-max mx-auto">
        <form 
          className="max-w-sm mx-auto" 
          onSubmit={handleSubmit(onSubmit)}
          style={{ willChange: 'transform' }}
        >
          <div className="mb-5">
            <label 
              htmlFor="email" 
              className="block mb-2 text-xl md:text-3xl font-medium text-gray-900"
            >
              Почта
            </label>
            <input 
              {...register('email')} 
              id="email"
              type="email"
              placeholder="Почта" 
              className={`border-2 text-lg md:text-2xl p-2 rounded-md w-full transform translate-z-0 
                ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              style={{ touchAction: 'manipulation' }}
            />
            {errors.email && <div className='text-red-900'>{errors.email.message}</div>}
          </div>

          <div className="mb-5">
            <label 
              htmlFor="password" 
              className="block mb-2 text-xl md:text-3xl font-medium text-gray-900"
            >
              Пароль
            </label>
            <input 
              {...register('password')} 
              id="password"
              type="password"
              placeholder="Пароль" 
              className={`border-2 text-lg md:text-2xl p-2 rounded-md w-full transform translate-z-0
                ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              style={{ touchAction: 'manipulation' }}
            />
            {errors.password && <div className='text-red-900'>{errors.password.message}</div>}
            {loginErrors && <div className='text-red-900'>Неверные почта или пароль</div>}
          </div>

          <div className="flex items-center justify-center min-w-max">
            <button 
              type="submit" 
              className="mr-5 h-10 w-[100px] xs:w-36 btn-red text-base md:text-2xl 
                       bg-dotted-spacing-3.5 bg-dotted-gray-200 bg-dotted-radius-[1.5px] 
                       flex items-center justify-center transform translate-z-0"
              style={{ touchAction: 'manipulation' }}
            >
              Войти
            </button>
            <button 
              type="button" 
              onClick={() => requestAnimationFrame(() => navigate('/register'))} 
              className="h-10 w-[180px] xs:w-60 btn-amber text-base md:text-2xl 
                       bg-dotted-spacing-3.5 bg-dotted-gray-200 bg-dotted-radius-[1.5px] 
                       flex items-center justify-center transform translate-z-0"
              style={{ touchAction: 'manipulation' }}
            >
              Зарегистрироваться
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default LoginPage
