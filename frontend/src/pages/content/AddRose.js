import { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import useRosebud from "../../hooks/useRosebud";
import { useNotification } from "../../context/NotificationContext";

function AddRose() {

    const api = useAxios();
    const { showNotification } = useNotification();

    const { loadResources } = useRosebud();

    const [groups, setGroups] = useState([]);
    const [breeders, setBreeders] = useState([]);
    
    useEffect(() => {
        const fetchData = async () => {

            const groups = await loadResources('groups/');
            const breeders = await loadResources('/breeders/');
            setGroups(groups);
            setBreeders(breeders);
        };
    
        fetchData();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        api.post('roses/', formData)
            .then((response) => {
                showNotification('Роза успешно создана');
            })
            .catch((error) => {
                if (
                    error.response.status === 400 ||
                    error.response.data.detail === 'Роза с таким title или title_eng уже существует.'
                ) {
                    showNotification(
                        `Роза с названием ${event.target.title.value} или ${event.target.title_eng.value} уже существует`
                    );
                }
            });
    };

    const renderField = ({ label, name, type = 'text', isRequired = false }) => (
        <p className="w-full text-sm rounded-md p-2 mr-2">
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor={name}>
                {label}:
            </label>
            <input
                type={type}
                name={name}
                maxLength={255}
                required={isRequired}
                className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"
            />
        </p>
    );

    const renderSelect = ({ label, name, options }) => (
        <p className="w-full text-sm rounded-md p-2 mr-2">
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor={name}>
                {label}:
            </label>
            <select name={name} className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full">
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
        </p>
    );

    const fields = [
        { label: 'Название', name: 'title', isRequired: true },
        { label: 'Название на английском', name: 'title_eng', isRequired: true },
        { label: 'Стандартная ширина', name: 'const_width' },
        { label: 'Стандартная высота', name: 'const_height' },
        { label: 'Уязвимости', name: 'susceptibility' },
        { label: 'Дата посадки', name: 'landing_date', type: 'date' },
        { label: 'Главное фото', name: 'photo', type: 'file' },
    ];

    const textAreas = [
        { label: 'Описание', name: 'description' },
        { label: 'Наблюдение', name: 'observation' },
    ];

    return (
        <>
            <div className="animate-fade-in bg-amber-500 dotted-back p-5 rounded-3xl flex items-center justify-center">
                <div className="w-4/5">
                    <div className="bg-rose-500 mx-auto dotted-back px-5 py-1.5 text-white rounded-md flex items-center justify-center">
                        <h2 className="text-4xl h-20 text-white flex items-center justify-center">ДОБАВИТЬ РОЗУ</h2>
                    </div>
                    <form method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
                        {fields.map(renderField)}
                        {renderSelect({ label: 'Группы', name: 'group', options: groups })}
                        {renderSelect({ label: 'Селекционеры', name: 'breeder', options: breeders })}
                        {textAreas.map(({ label, name }) => (
                            <p className="w-full text-sm rounded-md p-2 mr-2" key={name}>
                                <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor={name}>
                                    {label}:
                                </label>
                                <textarea
                                    name={name}
                                    cols="40"
                                    rows="5"
                                    className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"
                                />
                            </p>
                        ))}
                        <div className="flex items-center justify-center">
                            <button type="submit" className="btn-red text-xl h-11">
                                Создать
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default AddRose
