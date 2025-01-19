import { Routes, Route, useLocation } from 'react-router-dom';

import Menu from "./menu/Menu";
import Adjusting from "./menu-items/Adjusting";
import AddRose from "./content/AddRose";
import RoseGrid from "./content/RoseGrid";
import RoseLayout from "./content/RoseLayout";

import { RoseProvider } from '../context/RoseContext';
import { RoseListProvider } from '../context/RoseListContext';


function RoseList() {

    const location = useLocation()

    return (
        <Routes>
            <Route index element={<RoseGrid key={`${location.pathname}-index`} />} />
            <Route path="collection" element={<RoseGrid key={`${location.pathname}-index`} />} /> 
            <Route path="group/:groupName" element={<RoseGrid key={`${location.pathname}-index`} />} /> 
            <Route path="search" element={<RoseGrid key={`${location.pathname}-index`} />} /> 
        </Routes>
    )
}

export default function Homepage() {


    return (
        <div className="animate-fade-in">
            <Menu />
            <Routes>
                <Route 
                    path="home/*" 
                    element={
                        <RoseListProvider>
                            <RoseList />
                        </RoseListProvider>
                    }
                />
                <Route path="addrose/" element={<AddRose />}/>
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
