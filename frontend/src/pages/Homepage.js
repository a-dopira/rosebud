import { Routes, Route } from 'react-router-dom';

import Menu from "./menu/Menu";
import Adjusting from "./menu-items/Adjusting";
import AddRose from "./content/AddRose";
import RoseGrid from "./content/RoseGrid";
import RoseLayout from "./content/RoseLayout";

import { RoseProvider } from '../context/RoseContext';


function RoseList() {

    return (
        <Routes>
            <Route index element={<RoseGrid key="home-index" />} />
            <Route path="collection" element={<RoseGrid key="home-collection" />} /> 
            <Route path="group/:groupName" element={<RoseGrid key="home-group" />} /> 
            <Route path="search" element={<RoseGrid key="home-search" />} /> 
        </Routes>
    )
}

export default function Homepage() {

    return (
        <div className="animate-fade-in">
            <Menu />
            <Routes>
                <Route path="home/*" element={<RoseList />}/>
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
