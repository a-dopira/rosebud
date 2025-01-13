import { useState, useContext } from "react";
import DataContext from "../../context/DataContext";
import Sizes from "./RoseNoteSizes";
import useAxios from "../../hooks/useAxios";
import Notification from "../../utils/Notification";
import { Helmet } from 'react-helmet';
import { motion } from "framer-motion";


function RoseNote() {

    const { rose, setRose } = useContext(DataContext)

    const api = useAxios()

    const [observation, setObservation] = useState(rose.observation)
    const [susceptibility, setSusceptibility] = useState(rose.susceptibility)
    const [notification, setNotification] = useState()

    const [isEditing, setIsEditing] = useState(false)

    const updateRose = async (event) => {
        event.preventDefault()
        setNotification(null)
        const updatedRose = {
            observation,
            susceptibility
        };

        await api.patch(`roses/${rose.id}/`, updatedRose)
        .then(response => {
            setRose(response.data);
            setIsEditing(false)
            setNotification(`Роза ${response.data.title} успешно обновлена.`)
        })
        .catch(err => {
            setNotification(err.message)
        })
    } 

    return (
        <>
            <Helmet>
                <title>{rose.title}</title>
            </Helmet>
            <div>
                {!isEditing ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg"
                    >
                        <div className="mt-2">
                            <span className="text-xl font-bold">Наблюдение: </span> {rose.observation} 
                        </div>
                        <div className="mt-2">
                            <span className="text-xl font-bold">Уязвимости: </span> {rose.susceptibility} 
                        </div>
                    </motion.div>
                ) : (
                    <motion.form 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg" 
                        onSubmit={updateRose}
                    >
                        <label className="text-xl font-bold">
                            Наблюдение:
                        </label>
                        <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" name={observation} type="text" value={observation} onChange={e => setObservation(e.target.value)} />
                        <label className="text-xl font-bold">
                            Уязвимости:
                        </label>
                        <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" name={susceptibility} type="text" value={susceptibility} onChange={e => setSusceptibility(e.target.value)} />
                        <button type="submit" className="btn-red mt-2">Изменить</button>
                    </motion.form>
                )}
                <button className="btn-red mt-2" onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Скрыть' : 'Изменить'}</button>
                <Sizes/>
            </div>
            {notification && <Notification message={notification}/>}
        </>
    )
}

export default RoseNote