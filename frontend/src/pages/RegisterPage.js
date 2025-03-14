import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import AuthContext from "../context/AuthContext"

const schema = yup.object().shape({
  username: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
  password2: yup.string().oneOf([yup.ref('password'), null]).required()
});

function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data, event) => {
    event.preventDefault();
    registerUser(data.email, data.username, data.password, data.password2);
  };

  return (
    <>
      <Helmet>
        <title>{'Регистрация'}</title>
      </Helmet>
      <div className="animate-fade-in">
        <div className="min-h-max mx-auto">
          <form className="max-w-sm mx-auto space-y-5" onSubmit={handleSubmit(onSubmit)}>

            <div className="space-y-2">
              <label htmlFor="username" className="form-label">Логин</label>
              <input
                id="username"
                placeholder="Логин"
                className={`form-input text-lg md:text-2xl ${errors.username ? 'border-red-500' : ''}`}
                {...register('username')}
              />
              <span className='h-5 block text-red-500'>
                {errors.username && 'Это поле обязательно'}
              </span>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                placeholder="Email"
                className={`form-input text-lg md:text-2xl ${errors.email ? 'border-red-500' : ''}`}
                {...register('email')}
              />
              <span className='h-5 block text-red-500'>
                {errors.email && 'Введите корректный email'}
              </span>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="form-label">Пароль</label>
              <input
                id="password"
                type="password"
                placeholder="Пароль"
                className={`form-input text-lg md:text-2xl ${errors.password ? 'border-red-500' : ''}`}
                {...register('password')}
              />
              <span className='h-5 block text-red-500'>
                {errors.password && 'Пароль должен быть не менее 8 символов'}
              </span>
            </div>

            <div className="space-y-2"> 
              <label htmlFor="password2" className="form-label font-medium">Подтвердите пароль</label>
              <input
                id="password2"
                type="password"
                placeholder="Подтвердите пароль"
                className={`form-input text-lg md:text-2xl ${errors.password2 ? 'border-red-500' : ''}`}
                {...register('password2')}
              />
              <span className='h-5 block text-red-500'>
                {errors.password2 && 'Пароли должны совпадать'}
              </span>
            </div>

            <div className="flex items-center justify-center min-w-max space-x-5">
              <button type="submit" className="btn-amber h-10 w-full text-base md:text-2xl flex items-center justify-center">
                Зарегистрироваться
              </button>
              <button type="button" onClick={() => navigate('/login')} className="btn-red h-10 w-full text-base md:text-2xl flex items-center justify-center">
                Войти
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
