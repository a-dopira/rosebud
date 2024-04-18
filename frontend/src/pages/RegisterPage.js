import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
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

  const onSubmit = async (data) => {
    registerUser(data.email, data.username, data.password, data.password2);
  };

  return (
    <>
      <Helmet>
        <title>Регистрация</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="min-h-max mx-auto">
          <form className="max-w-sm mx-auto" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-5">
              <label htmlFor="username" className="block mb-2 text-3xl font-medium text-gray-900">Логин</label>
              <input
                id="username"
                placeholder="Логин"
                className={`border-2 text-2xl border-gray-300 p-2 rounded-md w-full ${errors.username ? 'border-red-500' : ''}`}
                {...register('username')}
              />
              {errors.username && <p className="text-red-500">Это поле обязательно</p>}
            </div>

            <div className="mb-5">
              <label htmlFor="email" className="block mb-2 text-3xl font-medium text-gray-900">Email</label>
              <input
                id="email"
                placeholder="Email"
                className={`border-2 text-2xl border-gray-300 p-2 rounded-md w-full ${errors.email ? 'border-red-500' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="text-red-500">Введите корректный email</p>}
            </div>

            <div className="mb-5">
              <label htmlFor="password" className="block mb-2 text-3xl font-medium text-gray-900">Пароль</label>
              <input
                id="password"
                type="password"
                placeholder="Пароль"
                className={`border-2 text-2xl border-gray-300 p-2 rounded-md w-full ${errors.password ? 'border-red-500' : ''}`}
                {...register('password')}
              />
              {errors.password && <p className="text-red-500">Пароль должен быть не менее 8 символов</p>}
            </div>

            <div className="mb-5">
              <label htmlFor="password2" className="block mb-2 text-3xl font-medium text-gray-900">Подтвердите пароль</label>
              <input
                id="password2"
                type="password"
                placeholder="Подтвердите пароль"
                className={`border-2 text-2xl border-gray-300 p-2 rounded-md w-full ${errors.password2 ? 'border-red-500' : ''}`}
                {...register('password2')}
              />
              {errors.password2 && <p className="text-red-500">Пароли должны совпадать</p>}
            </div>

            <div className="flex mx-auto items-center justify-center">
              <button type="submit" className=" mr-5 w-60 py-1.5 btn-amber text-2xl bg-dotted-spacing-3.5 bg-dotted-gray-200 bg-dotted-radius-[1.5px]">
                Зарегистрироваться
              </button>
              <button type="button" onClick={() => navigate('/login')} className="w-36 btn-red text-2xl bg-dotted-spacing-3.5 bg-dotted-gray-200 bg-dotted-radius-[1.5px]">
                Войти
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

export default RegisterPage;
