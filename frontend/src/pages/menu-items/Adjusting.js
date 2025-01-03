import { useState, useContext } from 'react';
import Notification from '../../utils/Notification';
import DataContext from '../../context/DataContext';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import AdjustForm from './AdjustForm';

function Adjusting() {
    const { 
        groupList, 
        setGroupList, 
        breederList, 
        setBreederList,
        pests,
        setPests,
        fungi,
        setFungi 
    } = useContext(DataContext);

    const [groupId, setGroupId] = useState('');
    const [groupName, setGroupName] = useState(''); 
    const [breederId, setBreederId] = useState('');
    const [breederName, setBreederName] = useState('');
    const [pestId, setPestId] = useState('');
    const [pestName, setPestName] = useState('');
    const [fungusId, setFungusId] = useState('');
    const [fungusName, setFungusName] = useState('');
    const [notification, setNotification] = useState(null);

    const configData = [
        {
            label: "Настроить группу:",
            value: { id: groupId, name: groupName },
            setValue: ({ id, name }) => {
                setGroupId(id);
                setGroupName(name);
            },
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
            value: { id: breederId, name: breederName },
            setValue: ({ id, name }) => {
                setBreederId(id);
                setBreederName(name);
            },
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
            value: { id: pestId, name: pestName },
            setValue: ({ id, name }) => {
                setPestId(id);
                setPestName(name);
            },
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
            value: { id: fungusId, name: fungusName },
            setValue: ({ id, name }) => {
                setFungusId(id);
                setFungusName(name);
            },
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
                <title>Настроить</title>
            </Helmet>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
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
                        setNotification={setNotification}
                    />
                ))}

                {notification && <Notification message={notification} />}
            </motion.div>
        </>
    );
}


export default Adjusting;
