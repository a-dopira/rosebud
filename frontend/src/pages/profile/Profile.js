import { useEffect, useState, useContext, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

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
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isEditing, setEditing] = useState(false);

  const modalRef = useRef(null);
  const modalContentRef = useRef(null);

  const { user } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const api = useAxios();

  const fetchProfile = async () => {
    const response = await api.get('user-profile/');
    setProfile(response.data);
  };

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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleEditClick = () => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    setEditing(true);
  };

  const handleCloseModal = () => {
    if (modalRef.current && modalContentRef.current) {
      modalRef.current.classList.remove('animate-fade-in');
      modalRef.current.classList.add('animate-fade-out');
      modalContentRef.current.classList.remove('animate-fade-in');
      modalContentRef.current.classList.add('animate-fade-out');
      
      // Оставляем paddingRight до завершения анимации
      setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        setEditing(false);
      }, 500); // Время анимации
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('app_header', data.app_header);
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }
    handleUpdateProfile(formData);
    setEditing(false);
  };

  const {
    username: profileUsername,
    app_header: profileHeader,
    image: profileImage
  } = profile || {};

  return (
    <>
      <Helmet>
        <title>{profileUsername ? profileUsername : 'Пупсик'} | Главная</title>
      </Helmet>

      <div
        className={`
          relative px-2.5 rounded-3xl 
          pattern-vertical-lines pattern-rose-500 pattern-size-16 pattern-bg-umbra pattern-opacity-100
          overflow-hidden
        `}
      >
        <button
          onClick={toggleCollapse}
          className="absolute right-5 top-5 w-8 h-8 p-1 rounded-full bg-white/20 hover:bg-white/30
                   transition-all duration-500 flex items-center justify-center z-50"
          aria-label="toggle-profile"
        >
          <div className="relative w-4 h-4">
            <span
              className={`absolute w-4 h-0.5 bg-white top-1/2 left-0 transform -translate-y-1/2 
                       transition-transform duration-500 ${isCollapsed ? 'rotate-45' : 'rotate-0'}`}
            />
            <span
              className={`absolute w-4 h-0.5 bg-white top-1/2 left-0 transform -translate-y-1/2 
                       transition-transform duration-500 ${isCollapsed ? '-rotate-45' : 'rotate-0'}`}
            />
          </div>
        </button>

        <div className="flex items-center p-4 h-20">
          <div className="flex-1 justify-center">
            <p className="font-lemon-tuesday text-[1.5rem] sm:text-[2.5rem] text-white text-center whitespace-nowrap overflow-hidden text-ellipsis">
              {profileHeader}
            </p>
          </div>
        </div>

        <div 
          className={`
            grid transition-all duration-500 ease-in-out
            ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}
          `}
        >
          <div className="overflow-hidden">
            <div className={`
              transition-all duration-500 ease-in-out
              ${isCollapsed ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
            `}>
              <div className="flex flex-wrap justify-center items-center gap-20 p-4 md:px-10 lg:px-20">
                {/* Изображение */}
                <div className="w-[300px] h-[300px] flex-shrink-0 rounded-full shadow-1xl overflow-hidden">
                  <img
                    src={profileImage || '/default-avatar.png'}
                    alt={profileUsername}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Оранжевый блок */}
                <div className="flex flex-col items-center min-w-[290px]">
                  <div className="w-[290px] min-h-[300px] shadow-1xl flex flex-col items-center justify-center rounded-large bg-amber-500 dotted-back p-4 transition-all duration-500">
                    <div id="profileInfoBlock" className="text-center p-4">
                      <div className="font-bold text-white mb-6 text-xl md:text-3xl break-words">
                        {profileUsername}
                      </div>
                      <div className="text-base md:text-xl text-black font-lemon-tuesday break-words">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleEditClick}
                    className="w-full max-w-[290px] btn-amber transition-transform transform px-4 py-2 
                            text-base md:text-xl h-10 mt-4 flex items-center justify-center"
                  >
                    Редактировать профиль
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal remains unchanged */}
        {isEditing && (
  <div
    ref={modalRef}
    onClick={handleCloseModal}
    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in"
  >
    <div
      ref={modalContentRef}
      onClick={(e) => e.stopPropagation()}
      className="relative bg-white rounded-lg p-6 max-w-[90%] md:max-w-[400px] shadow-3xl animate-fade-in"
    >
      {/* Кнопка-крестик */}
      <button
        onClick={handleCloseModal}
        className="absolute top-3 right-3 w-8 h-8 p-1 rounded-full bg-white/20 hover:bg-white/30
                   transition-all duration-500 flex items-center justify-center"
        aria-label="close-modal"
      >
        <div className="relative w-8 h-8 rounded-full bg-white hover:bg-white/70 transition-all duration-300 flex items-center justify-center group">
          <span
            className="absolute w-4 h-0.5 bg-black transform rotate-45 transition-colors duration-300 group-hover:bg-red-600"
          />
          <span
            className="absolute w-4 h-0.5 bg-black transform -rotate-45 transition-colors duration-300 group-hover:bg-red-600"
          />
        </div>
      </button>

      {/* Форма */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        <label htmlFor="username" className="font-serif font-bold text-gray-800">
          ИЗМЕНИТЬ ИМЯ
        </label>
        <input
          type="text"
          id="username"
          defaultValue={profileUsername}
          {...register('username')}
          className="w-full text-sm rounded-md p-2 border border-gray-300"
        />
        <p className="text-red-600 text-sm">{errors.username?.message}</p>

        <label htmlFor="app_header" className="font-serif font-bold text-gray-800">
          ИЗМЕНИТЬ НАЗВАНИЕ
        </label>
        <input
          type="text"
          id="app_header"
          defaultValue={profileHeader}
          {...register('app_header')}
          className="w-full text-sm rounded-md p-2 border border-gray-300"
        />
        <p className="text-red-600 text-sm">{errors.app_header?.message}</p>

        <label htmlFor="image" className="font-serif font-bold text-gray-800">
          ЗАГРУЗИТЬ ФОТО
        </label>
        <input
          type="file"
          id="image"
          {...register('image')}
          className="w-full bg-rose-500 text-white border border-gray-300 
                     rounded-md p-2 cursor-pointer"
        />
        <p className="text-red-600 text-sm">{errors.image?.message}</p>

        <button
          type="submit"
          name="change_user_profile"
          className="w-full bg-dotted-spacing-3.5 btn-red text-sm h-8 rounded-md"
        >
          Применить изменения
        </button>
      </form>
    </div>
  </div>
)}
      </div>
    </>
  );
};

export default Profile;


