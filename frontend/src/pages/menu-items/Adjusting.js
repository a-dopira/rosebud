import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import useRosebud from '../../hooks/useRosebud';
import AdjustForm from './AdjustForm';

function Adjusting() {

    const { loadResources } = useRosebud();

    const [group, setGroup] = useState({ id: '', name: '' });
    const [breeder, setBreeder] = useState({ id: '', name: '' });
    const [pest, setPest] = useState({ id: '', name: '' });
    const [fungus, setFungus] = useState({ id: '', name: '' });

    const [groupList, setGroupList] = useState([]);
    const [breederList, setBreederList] = useState([]);
    const [pests, setPests] = useState([]);
    const [fungi, setFungi] = useState([]);

    console.log('adjusting');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                
                const [groups, breeders, pestsData, fungiData] = await Promise.all([
                    loadResources('groups/'),
                    loadResources('breeders/'),
                    loadResources('pests/'),
                    loadResources('fungi/')
                ]);
    
                console.log("Группы:", groups);
                console.log("Селекционеры:", breeders);
                console.log("Вредители:", pestsData);
                console.log("Грибы:", fungiData);
    
                setGroupList(groups);
                setBreederList(breeders);
                setPests(pestsData);
                setFungi(fungiData);
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            }
        };
    
        fetchResources();
    }, []);

    const configData = [
        {
            label: "Настроить группу:",
            value: group,
            setValue: setGroup,
            list: groupList,
            endpoint: 'groups/',
            notificationMessages: {
                addSuccess: 'Группа "{name}" успешно добавлена.',
                addError: 'Группа с именем "{name}" уже существует. Пожалуйста, выберите другое имя.',
                deleteSuccess: 'Группа "{name}" успешно удалена.',
                deleteError: 'Группа "{name}" уже удалена.',
                deleteEmpty: 'Пожалуйста, выберите группу для удаления.',
            },
            listId: "group_list",
            setList: setGroupList,
        },
        {
            label: "Настроить селекционера:",
            value: breeder,
            setValue: setBreeder,
            list: breederList,
            endpoint: 'breeders/',
            notificationMessages: {
                addSuccess: 'Селекционер "{name}" успешно добавлен.',
                addError: 'Селекционер с именем "{name}" уже существует. Пожалуйста, выберите другое имя.',
                deleteSuccess: 'Селекционер "{name}" успешно удален.',
                deleteError: 'Селекционер "{name}" уже удален.',
                deleteEmpty: 'Пожалуйста, выберите селекционера для удаления.',
            },
            listId: "breeder_list",
            setList: setBreederList,
        },
        {
            label: "Настроить вредителей:",
            value: pest,
            setValue: setPest,
            list: pests,
            endpoint: 'pests/',
            notificationMessages: {
                addSuccess: 'Вредитель "{name}" успешно добавлен.',
                addError: 'Вредитель с именем "{name}" уже существует. Пожалуйста, выберите другое имя.',
                deleteSuccess: 'Вредитель "{name}" успешно удален.',
                deleteError: 'Вредитель "{name}" уже удален.',
                deleteEmpty: 'Пожалуйста, выберите вредителя для удаления.',
            },
            listId: "pest_list",
            setList: setPests,
        },
        {
            label: "Настроить грибы:",
            value: fungus,
            setValue: setFungus,
            list: fungi,
            endpoint: 'fungi/',
            notificationMessages: {
                addSuccess: 'Гриб "{name}" успешно добавлен.',
                addError: 'Гриб с именем "{name}" уже существует. Пожалуйста, выберите другое имя.',
                deleteSuccess: 'Гриб "{name}" успешно удален.',
                deleteError: 'Гриб "{name}" уже удален.',
                deleteEmpty: 'Пожалуйста, выберите гриб для удаления.',
            },
            listId: "fungi_list",
            setList: setFungi,
        },
    ];

    return (
        <>
            <Helmet>
                <title>{'Настроить'}</title>
            </Helmet>
            <div className="animate-fade-in space-y-4">
                {configData.map(({ label, value, setValue, list, endpoint, notificationMessages, listId, setList }) => (
                    <AdjustForm
                        key={listId}
                        label={label}
                        value={value}
                        setValue={setValue}
                        list={list}
                        endpoint={endpoint}
                        notificationMessages={notificationMessages}
                        listId={listId}
                        setList={setList}
                    />
                ))}
            </div>
        </>
    );
}


export default Adjusting;
