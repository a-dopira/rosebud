import { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { jwtDecode } from 'jwt-decode';

import AuthContext from '../../context/AuthContext';
import useAxios from '../../hooks/useAxios';
import { Helmet } from 'react-helmet';

const schema = yup.object().shape({
  username: yup.string().matches(/^[a-zA-Zа-яА-Я\s]+$/, 'Имя пользователя может содержать только буквы').required(),
  app_header: yup.string().matches(/^[a-zA-Zа-яА-Я\s]+$/, 'Заголовок может может содержать только буквы').required(),
  image: yup.mixed().test('fileFormat', 'Unsupported Format', value => {
    if (!value.length) return true;
    const supportedFormats = ['image/jpg', 'image/jpeg', 'image/png'];
    return supportedFormats.includes(value[0].type);
  }),
});

function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setEditing] = useState(false);
  const { user } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const api = useAxios();

  const fetchProfile = async () => {
    const response = await api.get('user-profile/');
    setProfile(response.data);
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (newData) => {
    const response = await api.patch('user-profile/', newData);
    if (response.status === 200) {
      setProfile(response.data);
      fetchProfile();
    }
  };
      
  const handleEditClick = () => setEditing(!isEditing);

  const onSubmit = data => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('app_header', data.app_header);
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }
    handleUpdateProfile(formData);
    setEditing(false);
  };
  
  const { username: profileUsername, app_header: profileAppHeader, image: profileImage } = profile || {};

  return (
    <>
  <Helmet>
    <title>{`${profileUsername ? profileUsername : 'Пупсик'} | Главная`}</title>
  </Helmet>
  <div className="px-2.5 rounded-3xl pattern-vertical-lines pattern-rose-500 pattern-size-16 pattern-bg-umbra pattern-opacity-100">
    <div className="text-center pt-5">
      <p className="text-3xl md:text-4xl lg:text-5xl font-lemon-tuesday text-white">
        {profileAppHeader}
      </p>
    </div>
    <div className="flex flex-col md:flex-row items-center md:justify-between h-full mb-4 p-4 md:px-10 lg:px-20 py-10 space-y-6 md:space-y-0">
      <img 
        src={profileImage || '/default-avatar.png'} 
        alt={profileUsername} 
        className="w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[350px] lg:h-[350px] shadow-1xl rounded-full md:mr-10 object-cover" 
      />
      {/* Обёртка для блока редактирования, которая ограничивает ширину и центрирует контент */}
      <div className="w-2/3 md:w-auto mx-auto">
        {/* Сам оранжевый блок */}
        <div className="w-2/3 md:w-[290px] h-auto md:h-[300px] shadow-1xl flex flex-col items-center justify-center rounded-large bg-amber-500 dotted-back p-4 mx-auto">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center space-y-2 w-full">
              <label htmlFor="username" className="font-serif font-bold text-white">
                ИЗМЕНИТЬ ИМЯ
              </label>
              <input 
                type="text" 
                id="username" 
                defaultValue={user?.username} 
                {...register('username')} 
                className="w-full max-w-[14rem] text-sm rounded-md p-2" 
              />
              <p className="text-red-600 text-sm">{errors.username?.message}</p>

              <label htmlFor="app_header" className="font-serif font-bold text-white">
                ИЗМЕНИТЬ НАЗВАНИЕ
              </label>
              <input 
                type="text" 
                id="app_header" 
                defaultValue={profileAppHeader} 
                {...register('app_header')} 
                className="w-full max-w-[14rem] text-sm rounded-md p-2" 
              />
              <p className="text-red-600 text-sm">{errors.user_header?.message}</p>

              <label htmlFor="image" className="font-serif font-bold text-white">
                ЗАГРУЗИТЬ ФОТО
              </label>
              <input 
                type="file" 
                id="image" 
                {...register('image')} 
                className="w-full max-w-[14rem] bg-rose-500 mx-auto border-solid text-white border-gray-300 border-[1px]
                  justify-between items-center rounded-md hover:shadow-3xl hover:translate-y-[-2px]
                  file:border-gray-300 file:border-[1px] file:w-32 file:rounded-md
                  file:cursor-pointer file:bg-white transition-transform
                  transform file:text-gray-500" 
              />
              <p className="text-red-600 text-sm">{errors.image?.message}</p>

              <button 
                type="submit" 
                name="change_user_profile" 
                className="w-full max-w-[14rem] bg-dotted-spacing-3.5 btn-red text-sm h-8"
              >
                Применить изменения
              </button>
            </form>
          ) : (
            <div id="profileInfoBlock" className="text-center p-4">
              <div className="font-bold text-white mb-6 text-2xl md:text-3xl break-words">
                {profileUsername}
              </div>
              <div className="text-lg md:text-xl text-black font-lemon-tuesday break-words">
                {user?.email}
              </div>
            </div>
          )}
        </div>
        {/* Кнопка редактирования, которая тоже центрирована */}
        <button 
          onClick={handleEditClick} 
          className="w-2/3 md:w-[290px] btn-amber transition-transform transform px-4 py-2 text-lg md:text-xl h-10 mt-4 flex items-center justify-center mx-auto"
        >
          Редактировать профиль
        </button>
      </div>
    </div>
  </div>
</>


  );
}

export default Profile;
