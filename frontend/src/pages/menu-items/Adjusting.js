import { useState, useEffect, useContext } from 'react';
import useAxios from '../../utils/useAxios';
import Notification from '../../utils/Notification';
import DataContext from '../../context/DataContext';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

function Adjusting() {
    const api = useAxios();
    
    const { 
        groupList, 
        setGroupList, 
        breederList, 
        setBreederList,
        pests,
        setPests,
        fungi,
        setFungi, 
        loadGroups, 
        loadBreeders,
        loadPests,
        loadFungi 
    } = useContext(DataContext);

    const [groupId, setGroupId] = useState('');
    const [groupName, setGroupName] = useState(''); 
    const [breederId, setBreederId] = useState('');
    const [breederName, setBreederName] = useState('');
    const [pestId, setPestId] = useState('')
    const [fungusId, setFungusId] = useState('')
    const [pestName, setPestName] = useState('');
    const [fungusName, setFungusName] = useState('');
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        loadGroups()
        loadBreeders()
        loadPests()
        loadFungi()
    }, [groupId, breederId, fungusId, pestId, groupName, breederName, fungusName, pestName]);
    

    const handleAddGroup = async () => {
        api.post('groups/', { name: groupName })
        .then(response => {
            setGroupList(prevGroupList => (prevGroupList ? [...prevGroupList, response.data] : [response.data]));            
            setGroupName('')  // Очистка инпутов по необходимости
            setNotification(`Группа ${groupName} успешна добавлена`)
        })
        .catch(err => {
            if (err.response && err.response.status === 400) {
                setNotification('Группа с таким именем уже существует. Пожалуйста, выберите другое имя.');
            } else {
                alert(err);
            }
        });
    };

    const handleDeleteGroup = async () => {
        if (!groupId) {
            setNotification(prev => prev !== 'Пожалуйста, выберите группу для удаления' ? 'Пожалуйста, выберите группу для удаления' : null);
            return
        }

        api.delete(`groups/${groupId}/`)
        .then(response => {
            setGroupList(prevGroupList => prevGroupList.filter(group => group.id !== groupId));
            setGroupName('')  // Очистка инпутов по необходимости
            setNotification(`Группа ${groupName} успешно удалена`)
        })
        .catch(err => {
            if (err.response && err.response.status === 404) {
                setNotification('Видимо такая группа уже существует... Побробуйте что-то другое')
            } else {
                alert(err)
            }
        });
    };

    const handleAddPest = async () => {
        api.post('pests/', { name: pestName })
        .then(response => {
            setPests(prevPests => (prevPests ? [...prevPests, response.data] : [response.data]));            
            setPestName('')  // Очистка инпутов по необходимости
            setNotification(`Группа ${pestName} успешна добавлена`)
        })
        .catch(err => {
            if (err.response && err.response.status === 400) {
                setNotification('Группа с таким именем уже существует. Пожалуйста, выберите другое имя.');
            } else {
                alert(err);
            }
        });
    };

    const handleDeletePest = async () => {
        if (!pestId) {
            setNotification(prev => prev !== 'Пожалуйста, выберите вредителя для удаления' ? 'Пожалуйста, выберите вредителя для удаления' : null);
            return
        }

        api.delete(`pests/${pestId}/`)
        .then(response => {
            setPests(prevPests => prevPests.filter(pest => pest.id !== pestId));
            setPestName('')  // Очистка инпутов по необходимости
            setNotification(`Вредитель ${pestName} успешно удалена`)
        })
        .catch(err => {
            if (err.response && err.response.status === 404) {
                setNotification('Видимо такая группа уже существует... Побробуйте что-то другое')
            } else {
                alert(err)
            }
        });
    };

    const handleAddFungus = async () => {
        api.post('fungi/', { name: fungusName })
        .then(response => {
            setFungi(prevFungi => ( prevFungi ? [...prevFungi, response.data] : [response.data]));
            setFungusName('')  // Очистка инпутов по необходимости
            setNotification(`Гриб ${fungusName} успешно добавлен!`);
        })
        .catch(err => {
            if (err.response && err.response.status === 400) {
                setNotification('Гриб с таким именем уже существует. Пожалуйста, выберите другое имя.');
            } else {
                alert(err);
            }
        });
    };

    const handleDeleteFungus = async () => {
        if (!breederId) {
            setNotification(prev => prev === 'Пожалуйста, выберите гриб для удаления' ? '' : 'Пожалуйста, выберите гриб для удаления');
            return
        }

        api.delete(`fungi/${fungusId}/`)
        .then(response => {
            setFungi(prevFungi => prevFungi.filter(fungus => fungus.id !== fungusId));
            setFungusName('')  // Очистка инпутов по необходимости
            setNotification(`Селекционер ${fungusName} успешно удален`);
        })
        .catch(err => {
            if (err.response && err.response.status === 404) {
                setNotification('Видимо такой гриб уже существует... Побробуйте что-то другое')
            } else {
                alert(err)
            }
        });
    };

    const handleAddBreeder = async () => {
        api.post('breeders/', { name: breederName })
        .then(response => {
            setBreederList(prevBreederList => ( prevBreederList ? [...prevBreederList, response.data] : [response.data]));
            setBreederName('')  // Очистка инпутов по необходимости
            setNotification(`Селекционер ${breederName} успешно добавлен!`);
        })
        .catch(err => {
            if (err.response && err.response.status === 400) {
                setNotification('Селекционер с таким именем уже существует. Пожалуйста, выберите другое имя.');
            } else {
                alert(err);
            }
        });
    };

    const handleDeleteBreeder = async () => {
        if (!breederId) {
            setNotification(prev => prev === 'Пожалуйста, выберите селекционера для удаления' ? '' : 'Пожалуйста, выберите селекционера для удаления');
            return
        }

        api.delete(`breeders/${breederId}/`)
        .then(response => {
            setBreederList(prevBreederList => prevBreederList.filter(breeder => breeder.id !== breederId));
            setBreederName('')  // Очистка инпутов по необходимости
            setNotification(`Селекционер ${breederName} успешно удален`);
        })
        .catch(err => {
            if (err.response && err.response.status === 404) {
                setNotification('Видимо такой селекционер уже существует... Побробуйте что-то другое')
            } else {
                alert(err)
            }
        });
    };

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
            {/* Форма для групп */}
            <form className="block">
                <label className="text-black inline-block text-2xl font-bold w-full my-2" htmlFor="group_name">Настроить группу:</label>
                <input className="border-2 p-2 mr-2 rounded-md" type="text" name="group_name" value={groupName} list="group_list" onChange={e => {
                    const selectedGroup = groupList.find(group => group.name === e.target.value);
                    if (selectedGroup) {
                        setGroupId(selectedGroup.id);
                        setGroupName(selectedGroup.name);
                    } else {
                        setGroupId('');
                        setGroupName(e.target.value);
                    }
                }} />               
                <datalist id="group_list">
                    {groupList.map(group => <option key={group.id} value={group.name} />)}
                </datalist>
                <button className="btn-red mr-2" type="button" onClick={handleAddGroup}>Добавить</button>
                <button className="btn-red" type="button" onClick={handleDeleteGroup}>Удалить</button>
            </form>

            {/* Форма для селекционеров */}
            <form className="block">
                <label className="text-black inline-block text-2xl font-bold w-full my-2" htmlFor="breeder_name">Настроить селекционера:</label>
                <input className="border-2 p-2 mr-2 rounded-md" type="text" name="breeder_name" value={breederName} list="breeder_list" onChange={e => {
                    const selectedBreeder = breederList.find(breeder => breeder.name === e.target.value);
                    if (selectedBreeder) {
                        setBreederId(selectedBreeder.id);
                        setBreederName(selectedBreeder.name);
                    } else {
                        setBreederId('');
                        setBreederName(e.target.value);
                    }
                }} />                
                <datalist id="breeder_list">
                    {breederList.map(breeder => <option key={breeder.id} value={breeder.name} />)}
                </datalist>
                <button className="btn-red mr-2" type="button" onClick={handleAddBreeder}>Добавить</button>
                <button className="btn-red" type="button" onClick={handleDeleteBreeder}>Удалить</button>
            </form>

            {/* Форма для вредителей */}
            <form className="block">
                <label className="text-black inline-block text-2xl font-bold w-full my-2" htmlFor="pest_name">Настроить вредителей:</label>
                <input className="border-2 p-2 mr-2 rounded-md" type="text" name="pest_name" value={pestName} list="pest_list" onChange={e => {
                    const selectedPest = pests.find(pest => pest.name === e.target.value);
                    if (selectedPest) {
                        setPestId(selectedPest.id);
                        setPestName(selectedPest.name);
                    } else {
                        setPestId('');
                        setPestName(e.target.value);
                    }
                }} />                
                <datalist id="pest_list">
                    {pests.map(pest => <option key={pest.id} value={pest.name} />)}
                </datalist>
                <button className="btn-red mr-2" type="button" onClick={handleAddPest}>Добавить</button>
                <button className="btn-red" type="button" onClick={handleDeletePest}>Удалить</button>
            </form>
            
            {/* Форма для грибов */}
            <form className="block">
                <label className="text-black inline-block text-2xl font-bold w-full my-2" htmlFor="fungus_name">Настроить грибы:</label>
                <input className="border-2 p-2 mr-2 rounded-md" type="text" name="fungus_name" value={fungusName} list="fungi_list" onChange={e => {
                    const selectedFungus = fungi.find(fungus => fungus.name === e.target.value);
                    if (selectedFungus) {
                        setFungusId(selectedFungus.id);
                        setFungusName(selectedFungus.name);
                    } else {
                        setFungusId('');
                        setFungusName(e.target.value);
                    }
                }} />                
                <datalist id="fungi_list">
                    {fungi.map(fungus => <option key={fungus.id} value={fungus.name} />)}
                </datalist>
                <button className="btn-red mr-2" type="button" onClick={handleAddFungus}>Добавить</button>
                <button className="btn-red" type="button" onClick={handleDeleteFungus}>Удалить</button>
            </form>

            {/* Уведомление */}
            {notification && <Notification message={notification} />}
        </motion.div>
        </>
    );
}


export default Adjusting;
