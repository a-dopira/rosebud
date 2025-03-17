import { useState, useContext } from "react";
import RoseContext from "../../context/RoseContext";
import RoseNoteSizes from "./RoseNoteSizes";
import useAxios from "../../hooks/useAxios";
import { useNotification } from "../../context/NotificationContext";
import { Helmet } from 'react-helmet';

function RoseNote() {

    const api = useAxios()

    const { rose, setRose } = useContext(RoseContext)
    const { showNotification } = useNotification()

    const [observation, setObservation] = useState(rose.observation)
    const [susceptibility, setSusceptibility] = useState(rose.susceptibility)
    const [isEditing, setIsEditing] = useState(false)

    const updateRose = async (event) => {
        event.preventDefault()
        const updatedRose = {
            observation,
            susceptibility
        };

        await api.patch(`roses/${rose.id}/`, updatedRose)
        .then(response => {
            setRose(response.data);
            setIsEditing(false)
            showNotification(`Роза ${response.data.title} успешно обновлена.`)
        })
        .catch(err => {
            showNotification(err.message)
        })
    } 

    return (
        <>
            <Helmet>
                <title>{`${rose.title}`}</title>
            </Helmet>
            <div>
                {!isEditing ? (
                    <div className="animate-fade-in my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg">
                        <div className="mt-2">
                            <span className="text-xl font-bold">Наблюдение: </span> {rose.observation} 
                        </div>
                        <div className="mt-2">
                            <span className="text-xl font-bold">Уязвимости: </span> {rose.susceptibility} 
                        </div>
                    </div>
                ) : (
                    <form
                        className="animate-fade-in my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg" 
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
                    </form>
                )}
                <button className="btn-red mt-2" onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Скрыть' : 'Изменить'}</button>
                
                <RoseNoteSizes/>
                
            </div>
        </>
    )
}

export default RoseNote