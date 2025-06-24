import { useState, useContext, useCallback, useMemo, useRef, memo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import AuthContext from '../../context/AuthContext';
import { Helmet } from 'react-helmet';

const schema = yup.object().shape({
  username: yup
    .string()
    .matches(/^[a-zA-Zа-яА-Я\s]+$/, 'Имя пользователя может содержать только буквы')
    .required(),
  app_header: yup
    .string()
    .matches(/^[a-zA-Zа-яА-Я\s]+$/, 'Заголовок может может содержать только буквы')
    .required(),
  image: yup.mixed().test('fileFormat', 'Unsupported Format', (value) => {
    if (!value.length) return true;
    const supportedFormats = ['image/jpg', 'image/jpeg', 'image/png'];
    return supportedFormats.includes(value[0].type);
  }),
});

const Profile = memo(() => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isEditing, setEditing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const modalRef = useRef(null);
  const modalContentRef = useRef(null);
  const contentRef = useRef(null);

  const { user, updateUserProfile } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const toggleCollapse = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsCollapsed(!isCollapsed);

    setTimeout(() => setIsAnimating(false), 500);
  }, [isCollapsed, isAnimating]);

  const handleEditClick = useCallback(() => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    setEditing(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (modalRef.current && modalContentRef.current) {
      requestAnimationFrame(() => {
        modalRef.current.classList.remove('animate-fade-in');
        modalRef.current.classList.add('animate-fade-out');
        modalContentRef.current.classList.remove('animate-fade-in');
        modalContentRef.current.classList.add('animate-fade-out');
      });

      setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        setEditing(false);
      }, 500);
    }
  }, []);

  const onSubmit = useCallback(
    (data) => {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('app_header', data.app_header);
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }

      updateUserProfile(formData);
      handleCloseModal();
    },
    [updateUserProfile, handleCloseModal]
  );

  const profileUsername = useMemo(() => user?.username || '', [user?.username]);
  const profileImage = useMemo(() => user?.image || '', [user?.image]);
  const profileHeader = useMemo(() => user?.app_header || '', [user?.app_header]);

  return (
    <>
      <Helmet>
        <title>{profileUsername ? profileUsername : 'Rosebud'} | Главная</title>
      </Helmet>

      <div
        className={`
          relative px-2.5 sm:rounded-3xl rounded-none
          pattern-vertical-lines pattern-rose-500 pattern-size-16 
          pattern-bg-umbra pattern-opacity-100
          overflow-hidden touch-manipulation
          will-change-auto
        `}
      >
        {/* toggle button */}
        <button
          onClick={toggleCollapse}
          disabled={isAnimating}
          className="absolute right-5 top-5 w-8 h-8 p-1 rounded-full bg-white/20 hover:bg-white/30
                   transition-colors duration-200 flex items-center justify-center z-50
                   disabled:pointer-events-none"
          aria-label="toggle-profile"
        >
          <div className="relative w-4 h-4">
            <span
              className={`absolute w-4 h-0.5 bg-white top-1/2 left-0 transform -translate-y-1/2 
                       transition-transform duration-300 ease-out will-change-transform
                       ${isCollapsed ? 'rotate-45' : 'rotate-0'}`}
            />
            <span
              className={`absolute w-4 h-0.5 bg-white top-1/2 left-0 transform -translate-y-1/2 
                       transition-transform duration-300 ease-out will-change-transform
                       ${isCollapsed ? '-rotate-45' : 'rotate-0'}`}
            />
          </div>
        </button>

        {/* header */}
        <div className="flex items-center p-4 h-20">
          <div className="flex-1 justify-center">
            <p className="font-lemon-tuesday text-[1.5rem] sm:text-[2.5rem] text-white text-center whitespace-nowrap overflow-hidden text-ellipsis">
              {profileHeader}
            </p>
          </div>
        </div>

        {/* main content with animation */}
        <div
          className={`
            grid transition-all duration-500 ease-in-out will-change-auto
            ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}
          `}
        >
          <div className="overflow-hidden">
            <div
              ref={contentRef}
              className={`
                transition-all duration-500 ease-in-out will-change-transform
                ${isCollapsed ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}
              `}
            >
              <div className="flex flex-wrap justify-center items-center sm:gap-20 gap-10 p-4 md:px-10 lg:px-20">
                {/* userphoto */}
                <div className="w-[300px] h-[300px] flex-shrink-0 rounded-full shadow-1xl overflow-hidden">
                  <img
                    src={profileImage}
                    alt={profileUsername}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* profile */}
                <div className="flex flex-col items-center min-w-[250px]">
                  <div className="w-[290px] min-h-[250px] shadow-1xl flex flex-col items-center justify-center rounded-large bg-amber-500 dotted-back p-4">
                    <div className="text-center p-4 space-y-6">
                      <div className="font-bold text-white text-xl md:text-3xl break-words">
                        {profileUsername}
                      </div>
                      <div className="font-lemon-tuesday text-black text-base md:text-xl break-words">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleEditClick}
                    className="w-full max-w-[290px] btn-amber transition-transform transform px-4 py-2 
                          text-base md:text-xl h-10 mt-4 flex items-center justify-center
                          hover:scale-105 active:scale-95"
                  >
                    Редактировать профиль
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* modal window */}
          {isEditing && (
            <div
              ref={modalRef}
              onClick={handleCloseModal}
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60] animate-fade-in"
            >
              <div
                ref={modalContentRef}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-lg p-6 max-w-[90%] md:max-w-[400px] shadow-3xl-rounded animate-fade-in
                        will-change-transform"
              >
                <button
                  onClick={handleCloseModal}
                  className="absolute top-3 right-3 w-8 h-8 p-1 rounded-full bg-white/20 hover:bg-white/30
                          transition-colors duration-200 flex items-center justify-center"
                  aria-label="close-modal"
                >
                  <div className="relative w-8 h-8 rounded-full bg-white hover:bg-white/70 transition-colors duration-200 flex items-center justify-center group">
                    <span className="absolute w-4 h-0.5 bg-black transform rotate-45 transition-colors duration-200 group-hover:bg-red-600" />
                    <span className="absolute w-4 h-0.5 bg-black transform -rotate-45 transition-colors duration-200 group-hover:bg-red-600" />
                  </div>
                </button>

                {/* form for editing */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col space-y-4"
                >
                  <label htmlFor="username" className="form-label">
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

                  <label htmlFor="app_header" className="form-label">
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

                  <label htmlFor="image" className="form-label">
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
                    className="w-full btn-red text-sm h-8"
                  >
                    Применить изменения
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default Profile;
