import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { jwtDecode } from 'jwt-decode';
import useAxios from '../../utils/useAxios';
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
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

    const api = useAxios();
    const token = localStorage.getItem("authTokens")

    if (token){
      const decode = jwtDecode(token)
      var username = decode.username
      var app_header = decode.app_header
      var email = decode.email
      var image = decode.image

    }

    const fetchProfile = async () => {
        const response = await api.get('profile/');
        setProfile(response.data);
    }

    useEffect(() => {
          fetchProfile();
      }, []);

      const handleUpdateProfile = async (newData) => {
        const response = await api.patch('profile/', newData);
        if (response.status === 200) {
          setProfile(response.data);
          fetchProfile()
        }
      };
      

  const handleEditClick = () => setEditing(!isEditing)

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
            <p className="text-5xl font-lemon-tuesday text-white">{profileAppHeader}</p>
        </div>
        <div className="flex items-center justify-between image-container h-full mb-4 px-20 py-10">
            <img src={`${profileImage ? profileImage : image}`} alt={profileUsername} className="scaling w-[350px] h-[350px] shadow-1xl rounded-full mr-10" />
            <div>
                <div className="h-[300px] w-[290px] shadow-1xl flex flex-col items-center justify-center rounded-large bg-amber-500 dotted-back">
                    {isEditing ? (
                    <form onSubmit={() =>handleSubmit(onSubmit)} className="flex flex-col items-center justify-center space-y-2">
                        <label htmlFor="username" className="font-serif font-bold text-white">ИЗМЕНИТЬ ИМЯ</label>
                        <input type="text" id="username" name="username" defaultValue={username} {...register('username')} className="w-56 text-sm rounded-md p-2 mr-2" />
                        <p>{errors.username?.message}</p>

                        <label htmlFor="app_header" className="font-serif font-bold text-white">ИЗМЕНИТЬ НАЗВАНИЕ</label>
                        <input type="text" id="app_header" name="app_header" defaultValue={app_header} {...register('app_header')} className="w-56 text-sm rounded-md p-2 mr-2" />
                        <p>{errors.user_header?.message}</p>

                        <label htmlFor="image" className="font-serif font-bold text-white">ЗАГРУЗИТЬ ФОТО</label>
                        <input type="file" id="image" name="image" {...register('image')} className="bg-rose-500 mx-auto border-solid text-white border-gray-300 border-[1px]
                                           justify-between items-center rounded-md hover:shadow-3xl hover:translate-y-[-2px]
                                           file:border-gray-300 file:border-[1px] file:w-32 file:rounded-md
                                           file:cursor-pointer file:bg-white w-56 transition-transform
                                           transform file:text-gray-500" />
                        <p>{errors.image?.message}</p>

                        <button type="submit" name="change_user_profile" className="bg-dotted-spacing-3.5 btn-red text-sm w-56 h-8">Применить изменения</button>
                    </form>
                    ) : (
                    <div id="profileInfoBlock">
                        <div className="font-bold text-white mb-10 text-3xl">{profileUsername}</div>
                        <div className="text-xl text-black font-lemon-tuesday">{email}</div>
                    </div>
                    )}
                    </div>
                <button onClick={() => handleEditClick} className="btn-amber transition-transform transform w-[290px] px-5 py-5 text-xl h-10 mt-4 flex items-center justify-center">Редактировать профиль</button>
            </div>
        </div>
        </div>
    </>
    
  )
}

export default Profile;
