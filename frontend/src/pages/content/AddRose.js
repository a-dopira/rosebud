import { useEffect, useContext } from "react";
import DataContext from "../../context/DataContext";
import { motion } from "framer-motion";
import useAxios from "../../utils/useAxios";
import Notification from "../../utils/Notification";
import { useNotification } from "../../utils/useNotification";

function AddRose() {

    const api = useAxios()
    const { notification, setNotificationMessage } = useNotification();

    const {
        loadGroups, 
        groupList, 
        loadBreeders, 
        breederList,
        setRosesList
    } = useContext(DataContext)

    useEffect(() => {
        loadGroups()
        loadBreeders()
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        api.post('roses/', formData)
        .then(response => {
            setNotificationMessage('Роза успешно создана')
            setRosesList(prevRosesList => prevRosesList ? [...prevRosesList, response.data] : [response.data])
        })
        .catch(error => {
            if (error.response.status === 400 || error.response.data.detail === 'Роза с таким title или title_eng уже существует.') {
                setNotificationMessage(`Роза с названием ${event.target.title.value} или ${event.target.title_eng.value} уже существует`)
            }
        })
    };

    return (
        <>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }} 
            className="bg-amber-500 dotted-back p-5 rounded-3xl flex items-center justify-center"
        >
            <div className="w-4/5 ">
                <div className="bg-rose-500 mx-auto dotted-back px-5 py-1.5 text-white rounded-md flex items-center justify-center">
                    <h2 className="text-4xl h-20 text-white flex items-center justify-center">ДОБАВИТЬ РОЗУ</h2>
                </div>
                <form method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
                    <p className="w-full text-sm rounded-md p-2 mr-2">
                        <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="title">
                            Название:
                        </label>
                        <input type="text" name="title" maxLength={255} required className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"/>
                    </p>
                    <p className="w-full text-sm rounded-md p-2 mr-2">
                        <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="title_eng">
                            Название на английском:
                        </label>
                        <input type="text" name="title_eng" maxLength={255} required className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"/>
                    </p>
                    <p className="w-full text-sm rounded-md p-2 mr-2">
                        <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="group">
                            Группы:
                        </label>
                        <select name='group' className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full ">
                            { groupList.map(group => {
                                return <option key={group.id} value={group.id}>{group.name}</option>
                            })}
                        </select>
                    </p>
                    <p className="w-full text-sm rounded-md p-2 mr-2">
                        <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="breeder">
                            Селекционеры:
                        </label>
                        <select name='breeder' className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full ">
                            { breederList.map(breeder => {
                                return <option key={breeder.id} value={breeder.id}>{breeder.name}</option>
                            })}
                        </select>
                    </p>
                    <p className="w-full text-sm rounded-md p-2 mr-2">
                        <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="const_width">
                            Стандартная ширина:
                        </label>
                        <input type="text" name="const_width" maxLength={255} className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"/>
                    </p>
                    <p className="w-full text-sm rounded-md p-2 mr-2">
                        <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="const_height">
                            Стандартная высота:
                        </label>
                        <input type="text" name="const_height" maxLength={255} className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"/>
                    </p>
                    <p className="w-full text-sm rounded-md p-2 mr-2">
                        <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="susceptibility">
                            Уязвимости:
                        </label>
                        <input type="text" name="susceptibility" maxLength={255} className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"/>
                    </p>
                    <p className="w-full text-sm rounded-md p-2 mr-2">
                        <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="landing_date">
                            Дата посадки:
                        </label>
                        <input type="date" name="landing_date" maxLength={255} className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"/>
                    </p>
                    <p className="w-full text-sm rounded-md p-2 mr-2">
                        <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="photo">
                            Главное фото:
                        </label>
                        <input type="file" name="photo" maxLength={255} className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"/>
                    </p>
                    <p className="w-full text-sm rounded-md p-2 mr-2">
                        <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="description">
                            Описание:
                        </label>
                        <textarea name='description' cols="40" rows="5" className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"/>
                    </p>
                    <p className="w-full text-sm rounded-md p-2 mr-2">
                        <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="observation">
                            Наблюдение:
                        </label>
                        <textarea name='observation' cols="40" rows="5" className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"/>
                    </p>
                    <div className="flex items-center justify-center">
                        <button type="submit" className="btn-red text-xl h-11">Создать</button>
                    </div>
                </form>
            </div>
        </motion.div>
        {notification && <Notification message={notification} />}
        </>
    )
}

export default AddRose

