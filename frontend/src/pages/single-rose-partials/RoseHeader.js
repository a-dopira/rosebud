import { useContext, useState, useEffect } from "react"
import RoseContext from "../../context/RoseContext"
import { Link } from "react-router-dom"
import useAxios from "../../hooks/useAxios"
import useRosebud from "../../hooks/useRosebud"
import { useNotification } from "../../context/NotificationContext";
import DeleteNotificationModal from "../../utils/DeleteNotificationModal";

function RoseHeader({ setFilter }) {

    const { loadResources } = useRosebud()

    const { rose, setRose } = useContext(RoseContext)

    const { showNotification } = useNotification()
    const [modal, setShowModal] = useState(false)
    const [breeders, setBreeders] = useState([])
    const [showDeletePhotoModal, setShowDeletePhotoModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false)
    const api = useAxios()

    console.log(rose)

    useEffect(() => {
        const fetchData = async () => {
            await loadResources('breeders/').then(setBreeders)
        }

        fetchData()
    }, [])

    const updateRose = async (event) => {
        event.preventDefault()
        showNotification(null)
        const updatedRose = new FormData(event.target);

        await api.patch(`roses/${rose.id}/`, updatedRose)
        .then(response => {
            setRose(response.data);
            setIsEditing(false)
            showNotification(`Роза ${response.data.title} успешно обновлена.`)
        })
        .catch(error => {
            if (error.response.status === 400 || error.response.data.detail === 'Роза с таким title или title_eng уже существует.') {
                showNotification(`Роза с названием ${event.target.title.value} или ${event.target.title_eng.value} уже существует`)
            }
        })
    }

    const openModal = () => {
        setShowModal(true);
    };

    const openDeletePhotoModal = () => {
        setShowDeletePhotoModal(true);
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing)
    }

    return (
        <div className="flex">
        <div className="left-side w-1/2 p-5 flex items-center justify-center">
            <div className="relative inline-block img-container group">
                <img src={rose.photo} alt={rose.title} className="block transition-transform duration-300 transform group-hover:opacity-70"/>
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 btn-red" onClick={openDeletePhotoModal}>Удалить</button>
            </div>
        </div>
        <div className="right-side w-1/2 h-auto">
            <div className="flex">
                <div className="flex h-8 bg-umbra rounded-l-full">
                    <Link className="flex bg-rose-500 px-2 py-1 text-white rounded-l-full justify-center text-center hover:text-white"
                       to={`home/${rose.group_name}`} onClick={() => setFilter(rose.group_name)}>
                    { rose.group_name }
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
                    { rose.title }
                    </div>
                </div>
                    <div 
                        className="
                            w-0 h-0
                            border-t-[16px] border-t-transparent
                            border-l-[20px] border-l-umbra
                            border-b-[16px] border-b-transparent
                    "/>
            </div>
            <div className="mt-5 border-solid border-gray-300 border-[1px] rounded-lg">
                <div className="relative"> 
            {!isEditing ? (
                <div className="p-5 space-y-2 animate-fade-in">
                <div className="bg-white form-partials text-2xl">
                    {rose.title} ({rose.title_eng})
                </div>
                <div className="bg-white form-partials text-2xl">
                    {rose.const_width ? `Габитус: ${rose.const_width}см` : 'Габитус незадан'}
                </div>
                <div className="bg-white form-partials text-2xl">
                    {rose.const_height ? `Высота: ${rose.const_height}см` : 'Высота незадана'}
                </div>
                <div className="bg-white form-partials text-2xl">
                    {rose.breeder && rose.breeder_name ? `Селекционер: ${rose.breeder_name}` : 'Селекционер отсутствует'}
                </div>
                <div className="bg-white form-partials text-2xl">
                    {rose.landing_date ? `Дата посадки: ${rose.landing_date}` : 'Отсутсвует дата посадки'}
                </div>
                <div className="bg-white form-partials text-2xl">
                    {rose.description ? `Описание:\n${rose.description}` : 'Добавьте описание'}
                </div>
            </div>
            ) : (
                <div className="text-white text-sm bg-umbra pattern-vertical-lines pattern-rose-500 pattern-size-16 pattern-bg-umbra pattern-opacity-100 rounded-lg border-solid border-gray-300 border-2 animate-fade-in">
                    <form encType="multipart/form-data" className="p-5" onSubmit={updateRose}>
                        <label className="inline-block w-full text-sm" htmlFor="title">Изменить название</label>
                        <input className="inline-block text-black rounded-lg w-full p-2" type="text" name="title" defaultValue={ rose.title }/>
                        <label className="inline-block w-full text-sm" htmlFor="title_eng">Изменить описание на англ</label>
                        <input className="inline-block text-black rounded-lg w-full p-2" type="text" name="title_eng" defaultValue={ rose.title_eng }/>
                        <label className="inline-block w-full text-sm" htmlFor="const_width">Изменить ширину</label>
                        <input className="inline-block text-black rounded-lg w-full p-2" type="text" name="const_width" defaultValue={ rose.const_width }/>
                        <label className="inline-block w-full text-sm" htmlFor="const_height">Изменить высоту</label>
                        <input className="inline-block text-black rounded-lg w-full p-2" type="text" name="const_height" defaultValue={ rose.const_height }/>
                        <label className="inline-block w-full text-sm" htmlFor="breeder">Изменить селекционера</label>
                        <select className="inline-block border-2 p-2 rounded-md text-black w-full" name='breeder' >
                            { breeders.map(breeder => {
                                return <option key={breeder.id} value={breeder.id}>{breeder.name}</option>
                            })}
                        </select>
                        <label className="inline-block w-full text-sm" htmlFor="landing_date">Изменить дату посадки</label>
                        <input className="inline-block text-black rounded-lg w-full" type="date" name="landing_date" defaultValue={ rose.landing_date }/>
                        <label className="text-sm font-bold">
                            Выбрать файл:
                        </label>
                        <input className="inline-block border-2 mr-2 rounded-md text-black w-full" type="file" name="photo" />
                        <label className="inline-block w-full text-sm" htmlFor="description">Описание</label>
                        <textarea className="inline-block text-black rounded-lg w-full" defaultValue={ rose.description } name="description"></textarea>
                        <button className="inline-block btn-red text-xl h-11" type="submit">Обновить</button>
                    </form>
                </div>
            )}
                <div className="flex items-center justify-center p-5">
                    <button className="inline-block btn-red text-xl h-11" onClick={toggleEdit}>Изменить</button>
                    <button className="inline-block btn-red text-xl h-11" onClick={() => openModal()} >Удалить</button>
                </div>
                </div>
            </div>
        </div>
        {modal && (
            <DeleteNotificationModal
                itemId={rose.id}
                itemType="розу"
                apiEndpoint="roses"
                setShowModal={setShowModal}
                updateState={null}
            />
        )}
        {showDeletePhotoModal && (
            <DeleteNotificationModal
                itemId={rose.id}
                itemType="фото"
                apiEndpoint={`roses/${rose.id}/delete_photo`}
                setShowModal={setShowDeletePhotoModal}
                updateState={prevState =>
                    setRose((prevRose) => ({
                        ...prevRose,
                        photo: null,
                    }))
                }
            />
        )}
    </div>
    )
}

export default RoseHeader