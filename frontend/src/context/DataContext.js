import { createContext, useState } from "react";
import useAxios from "../utils/useAxios";

const DataContext = createContext()

export function DataProvider({ children }) {
    const [groupList, setGroupList] = useState([])
    const [breederList, setBreederList] = useState([])
    const [pests, setPests] = useState([])
    const [fungi, setFungi] = useState([])
    const [rosesList, setRosesList] = useState([])
    const [rose, setRose] = useState([])

    const [message, setMessage] = useState(null)
    const api = useAxios();

    const loadGroups = async () => {
        const response = await api.get('groups/');
        setGroupList(response.data);
    };

    const loadBreeders = async () => {
        const response = await api.get('/breeders/')
        setBreederList(response.data)
    }

    const loadPests = async () => {
        const response = await api.get('pests/')
        setPests(response.data)
    }

    const loadFungi = async () => {
        const response = await api.get('fungi/')
        setFungi(response.data)
    }

    const loadRoses = async () => {
        const response = await api.get('roses/')
        setRosesList(response.data)
    }

    const loadRose = async (id) => {
        const response = await api.get(`roses/${id}/`)
        setRose(response.data)
    }

    const handleCategorySelect = async (groupId, groupName) => {
        api.get(`/roses/?group=${groupId}`)
        .then(response => {
            setRosesList(response.data);
            if (response.data.length <= 0) {
                setMessage(null)
            } else {
                setMessage('Все розы из группы ' + groupName)
            }
        })
    };

    const contextData = {
        groupList,
        breederList,
        pests,
        fungi,
        rosesList,
        rose,
        message,
        setGroupList,
        setBreederList,
        setPests,
        setFungi,
        setRosesList,
        setRose,
        setMessage,
        loadGroups,
        loadBreeders,
        loadPests,
        loadFungi,
        loadRoses,
        loadRose,
        handleCategorySelect
    }

    return (
        <DataContext.Provider value={contextData}>
            {children}
        </DataContext.Provider>
    );
}

export default DataContext;