import { useContext, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import DataContext from '../context/DataContext';
import { DataProvider } from '../context/DataContext';

import Menu from "./menu/Menu";
import RoseGrid from "./content/RoseGrid";
import AddRose from "./content/AddRose";
import Adjusting from "./menu-items/Adjusting";
import Collection from "./menu-items/Collection";
import RoseLayout from "./content/RoseLayout";

import { RoseProvider } from '../context/RoseContext';


function RoseList({ filter }) {
    const { loadRoses, setMessage, setQueryParam } = useContext(DataContext)

    const location = useLocation()

    useEffect(() => {    
        setMessage(null)
        setQueryParam(filter)
        loadRoses()
    }, [filter])

    return (
        <Routes>
            <Route index element={<RoseGrid key={location.pathname}/>} />
            <Route path="collection" element={<Collection key={location.pathname} />} /> 
            <Route path="group/:groupName" element={<RoseGrid key={location.pathname} />} /> 
            <Route path="search" element={<RoseGrid key={location.pathname} />} /> 
        </Routes>
    )
}

export default function Homepage() {

    const [filter, setFilter] = useState({});

    return (
        <div className="animate-fade-in">
            <Menu setFilter={setFilter}/>
            <Routes>
                <Route 
                    path="home/*" 
                    element={
                        <DataProvider>
                            <RoseList filter={filter}/>
                        </DataProvider>
                    }
                />
                <Route path="addrose/" element={<AddRose/>}/>
                <Route path="adjusting/" element={<Adjusting/>}/>
                <Route 
                    path="/:roseId/*" 
                    element={
                        <RoseProvider>
                            <RoseLayout/>
                        </RoseProvider>
                    }
                />
            </Routes>
        </div>
    )
}
