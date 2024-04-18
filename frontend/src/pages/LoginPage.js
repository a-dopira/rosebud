import { useContext, useEffect } from "react"
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

    const {loginUser, loginErrors, setLoginErrors} = useContext(AuthContext)
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm({
      resolver: yupResolver(schema),
    });

    useEffect(() => {
      setLoginErrors(false)
    }, [])

    const onSubmit = async (data) => await loginUser(data.email, data.password)

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
              <input id="email" {...register('email')} placeholder="Почта" className={`border-2 text-2xl p-2 rounded-md w-full ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.email && <div className='text-red-900'>{errors.email.message}</div>}
            </div>

            <div className="mb-5">
              <label htmlFor="password" className="block mb-2 text-3xl font-medium text-gray-900">Пароль</label>
              <input id="password" type="text" {...register('password')} placeholder="Пароль" className={`border-2 text-2xl p-2 rounded-md w-full ${errors.password ? 'border-red-500' : 'border-gray-300'}`} />
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
