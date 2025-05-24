import { useContext, useState, useEffect } from 'react';
import RoseContext from '../../context/RoseContext';
import { Link } from 'react-router-dom';
import useAxios from '../../hooks/useAxios';
import useRosebud from '../../hooks/useRosebud';
import { useNotification } from '../../context/NotificationContext';
import { GenericModal } from '../../utils/RoseComponents/ModalProduct';
import Loader from '../../utils/Loaders/Loader';

function RoseHeader() {
  const { loadResources } = useRosebud();
  const { rose, setRose } = useContext(RoseContext);
  const { showNotification } = useNotification();

  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePhotoModal, setDeletePhotoModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [breeders, setBreeders] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { api } = useAxios();

  useEffect(() => {
    const fetchData = async () => {
      await loadResources('breeders/').then(setBreeders);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateRose = async (event) => {
    event.preventDefault();
    showNotification(null);
    const updatedRose = new FormData(event.target);

    await api
      .patch(`roses/${rose.id}/`, updatedRose)
      .then((response) => {
        setRose(response.data);
        setEditModal(false);
        showNotification(`Роза ${response.data.title} успешно обновлена.`);
      })
      .catch((error) => {
        if (
          error.response.status === 400 ||
          error.response.data.detail ===
            'Роза с таким title или title_eng уже существует.'
        ) {
          showNotification(
            `Роза с названием ${event.target.title.value} или ${event.target.title_eng.value} уже существует`
          );
        }
      });
  };

  const isStackedLayout = windowWidth < 768;

  if (!rose) {
    return <Loader />;
  }

  return (
    <div className={`flex flex-col ${!isStackedLayout ? 'md:flex-row' : ''}`}>
      <div
        className={`${!isStackedLayout ? 'md:w-1/2' : 'w-full'} p-5 flex items-center justify-center`}
      >
        <div className="relative inline-block img-container group">
          <img
            src={rose.photo}
            alt={rose.title}
            className="block transition-transform duration-300 transform group-hover:opacity-70 max-w-full"
          />
          <button
            className="absolute top-1/2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 btn-red"
            onClick={() => setDeletePhotoModal(true)}
          >
            Удалить
          </button>
        </div>
      </div>

      <div className={`${!isStackedLayout ? 'md:w-1/2' : 'w-full'} px-5 pb-5`}>
        <div className="flex mb-3">
          <div className="flex h-8 bg-umbra rounded-l-full">
            <Link
              className="flex bg-rose-500 px-2 py-1 text-white rounded-l-full justify-center text-center hover:text-white"
              to={`/home/group/${rose.group.name}/`}
            >
              {rose.group.name}
            </Link>
            <div
              className="
                                w-0 h-0
                                border-t-[16px] border-t-transparent
                                border-l-[20px] border-l-rose-500
                                border-b-[16px] border-b-transparent
                            "
            />
            <div className="bg-umbra px-2 py-1 text-white justify-center text-center">
              {rose.title}
            </div>
          </div>
          <div
            className="
                            w-0 h-0
                            border-t-[16px] border-t-transparent
                            border-l-[20px] border-l-umbra
                            border-b-[16px] border-b-transparent
                        "
          />
        </div>

        <div className="border-solid border-gray-300 border-[1px] rounded-lg p-5">
          <div className="relative">
            <div className="p-5 space-y-5 animate-fade-in">
              <h2 className="form-label mb-4 border-b-2 pb-2 text-center">
                {rose.title} ({rose.title_eng})
              </h2>

              <div className="w-full overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                  <tbody>
                    <tr>
                      <td className="text-xl font-medium w-1/3">Габитус:</td>
                      <td className="text-xl">
                        {rose.const_width ? `${rose.const_width} см` : 'Не задан'}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-xl font-medium">Высота:</td>
                      <td className="text-xl">
                        {rose.const_height ? `${rose.const_height} см` : 'Не задана'}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-xl font-medium">Селекционер:</td>
                      <td className="text-xl">{rose.breeder.name || 'Не указан'}</td>
                    </tr>
                    <tr>
                      <td className="text-xl font-medium">Дата посадки:</td>
                      <td className="text-xl">{rose.landing_date || 'Не указана'}</td>
                    </tr>
                    <tr>
                      <td className="text-xl font-medium">Описание:</td>
                      <td className="text-xl">{rose.description || 'Отсутствует'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-10">
              <button
                className="inline-block btn-red text-xl h-11"
                onClick={() => setEditModal(true)}
              >
                Изменить
              </button>
              <button
                className="inline-block btn-red text-xl h-11"
                onClick={() => setDeleteModal(true)}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* edit modal */}
      <GenericModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Редактирование"
        roseName={rose.title}
      >
        <div className="text-sm">
          <form
            encType="multipart/form-data"
            className="space-y-3"
            onSubmit={updateRose}
          >
            <label className="block w-full mb-1" htmlFor="title">
              Изменить название
            </label>
            <input
              className="form-input"
              type="text"
              name="title"
              defaultValue={rose.title}
            />

            <label className="block w-full mb-1" htmlFor="title_eng">
              Изменить описание на англ
            </label>
            <input
              className="form-input"
              type="text"
              name="title_eng"
              defaultValue={rose.title_eng}
            />

            <label className="block w-full mb-1" htmlFor="const_width">
              Изменить ширину
            </label>
            <input
              className="form-input"
              type="text"
              name="const_width"
              defaultValue={rose.const_width}
            />

            <label className="block w-full mb-1" htmlFor="const_height">
              Изменить высоту
            </label>
            <input
              className="form-input"
              type="text"
              name="const_height"
              defaultValue={rose.const_height}
            />

            <label className="block w-full mb-1" htmlFor="breeder">
              Изменить селекционера
            </label>
            <select className="form-input" name="breeder" defaultValue={rose.breeder}>
              {breeders.map((breeder) => (
                <option key={breeder.id} value={breeder.id}>
                  {breeder.name}
                </option>
              ))}
            </select>

            <label className="block w-full mb-1" htmlFor="landing_date">
              Изменить дату посадки
            </label>
            <input
              className="form-input"
              type="date"
              name="landing_date"
              defaultValue={rose.landing_date}
            />

            <label className="block w-full mb-1 font-bold">Выбрать файл:</label>
            <input className="form-input" type="file" name="photo" />

            <label className="block w-full mb-1" htmlFor="description">
              Описание
            </label>
            <textarea
              className="form-input"
              defaultValue={rose.description}
              name="description"
              rows="4"
            ></textarea>

            <div className="flex space-x-2 mt-4">
              <button className="flex-1 btn-red text-lg py-2" type="submit">
                Обновить
              </button>
              <button
                className="flex-1 btn-gray text-lg py-2"
                type="button"
                onClick={() => setEditModal(false)}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </GenericModal>

      <GenericModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Удаление розы"
        roseName={rose.title}
      >
        <div className="text-center mb-4">
          <p className="mb-4">Вы уверены, что хотите удалить эту розу?</p>
          <div className="flex space-x-4">
            <button
              onClick={async () => {
                await api.delete(`roses/${rose.id}/`);
                setDeleteModal(false);
                showNotification('Роза успешно удалена.');
              }}
              className="flex-1 btn-red py-2"
            >
              Да, удалить
            </button>
            <button
              onClick={() => setDeleteModal(false)}
              className="flex-1 btn-gray py-2"
            >
              Отмена
            </button>
          </div>
        </div>
      </GenericModal>

      <GenericModal
        isOpen={deletePhotoModal}
        onClose={() => setDeletePhotoModal(false)}
        title="Удаление фотографии"
        roseName={rose.title}
      >
        <div className="text-center space-y-4">
          <p className="mb-4">Вы уверены, что хотите удалить фотографию розы?</p>
          <div className="flex space-x-4">
            <button
              onClick={async () => {
                await api.delete(`roses/${rose.id}/photo/`);
                setDeletePhotoModal(false);
                setRose((prevRose) => ({
                  ...prevRose,
                  photo: null,
                }));
                showNotification('Фотография успешно удалена.');
              }}
              className="flex-1 btn-red py-2"
            >
              Да, удалить
            </button>
            <button
              onClick={() => setDeletePhotoModal(false)}
              className="flex-1 btn-gray py-2"
            >
              Отмена
            </button>
          </div>
        </div>
      </GenericModal>
    </div>
  );
}

export default RoseHeader;
