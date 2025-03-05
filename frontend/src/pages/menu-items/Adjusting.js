import { useState, useCallback, useContext } from 'react';
import { Helmet } from 'react-helmet';
import AdjustForm from './AdjustForm';

import DataContext from '../../context/DataContext';

function Adjusting() {
    
    const { 
        groups: groupList, 
        breeders: breederList, 
        pests,
        fungi,
        updateGroupsDirectly,
        updateBreedersDirectly,
        updatePestsDirectly,
        updateFungiDirectly
    } = useContext(DataContext);
    
    const [group, setGroup] = useState({ id: '', name: '' });
    const [breeder, setBreeder] = useState({ id: '', name: '' });
    const [pest, setPest] = useState({ id: '', name: '' });
    const [fungus, setFungus] = useState({ id: '', name: '' });
    
    console.log('adjusting');
    
    const syncGroupList = useCallback((newList) => {
        updateGroupsDirectly(newList);
    }, [updateGroupsDirectly]);
    
    const syncBreederList = useCallback((newList) => {
        updateBreedersDirectly(newList);
    }, [updateBreedersDirectly]);
    
    const syncPestList = useCallback((newList) => {
        updatePestsDirectly(newList);
    }, [updatePestsDirectly]);
    
    const syncFungiList = useCallback((newList) => {
        updateFungiDirectly(newList);
    }, [updateFungiDirectly]);
    
    const configData = [
        {
            label: "Настроить группу:",
            value: group,
            setValue: setGroup,
            list: groupList,
            endpoint: 'groups/',
            notificationMessages: {},
            listId: "group_list",
            setList: syncGroupList,
        },
        {
            label: "Настроить селекционера:",
            value: breeder,
            setValue: setBreeder,
            list: breederList,
            endpoint: 'breeders/',
            notificationMessages: {},
            listId: "breeder_list",
            setList: syncBreederList,
        },
        {
            label: "Настроить вредителей:",
            value: pest,
            setValue: setPest,
            list: pests,
            endpoint: 'pests/',
            notificationMessages: {},
            listId: "pest_list",
            setList: syncPestList,
        },
        {
            label: "Настроить грибы:",
            value: fungus,
            setValue: setFungus,
            list: fungi,
            endpoint: 'fungi/',
            notificationMessages: {},
            listId: "fungi_list",
            setList: syncFungiList,
        },
    ];
    
    return (
        <>
            <Helmet>
                <title>{'Настроить'}</title>
            </Helmet>
            <div className="">
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
