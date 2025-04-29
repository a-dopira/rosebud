import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import AuthContext from '../context/AuthContext';

const schema = yup.object().shape({
  email: yup.string().required('Почта обязательна для заполнения'),
  password: yup.string().required('Пароль обязателен для заполнения'),
});

function LoginPage() {
  const [loginErrors, setLoginError] = useState(null);
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setLoginError(null);
    const success = await login(data.email, data.password);
    if (!success) {
      setLoginError('Неверный логин или пароль');
    }
  };

  return (
    <>
      <Helmet>
        <title>{'Добро пожаловать!'}</title>
      </Helmet>
      <div className="h-full w-full flex items-center justify-center">
        <form className="max-w-sm mx-auto space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="email" className="form-label text-xl md:text-3xl">
            Почта
          </label>
          <div className="flex flex-col">
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="Почта"
              className={`form-input text-lg md:text-2xl ${errors.email && 'border-red-500'}`}
            />
            <div className="min-h-8 text-red-900">
              {errors.email && errors.email.message}
            </div>
          </div>

          <label htmlFor="password" className="form-label text-xl md:text-3xl">
            Пароль
          </label>
          <div className="flex flex-col">
            <input
              {...register('password')}
              id="password"
              type="password"
              placeholder="Пароль"
              className={`form-input text-lg md:text-2xl ${errors.password && 'border-red-500'}`}
            />
            <div className="min-h-8 text-red-900">
              {loginErrors
                ? 'Неверный логин или пароль'
                : errors.password
                  ? errors.password.message
                  : ''}
            </div>
          </div>

          <div className="flex items-center justify-center min-w-max space-x-5">
            <button
              type="submit"
              className="btn-red h-10 w-full text-base md:text-2xl flex items-center justify-center"
            >
              Войти
            </button>
            <button
              type="button"
              onClick={() => requestAnimationFrame(() => navigate('/register'))}
              className="btn-amber h-10 w-full text-base md:text-2xl flex items-center justify-center"
            >
              Зарегистрироваться
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default LoginPage;
