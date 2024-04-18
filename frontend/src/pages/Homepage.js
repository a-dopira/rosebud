import { Routes, Route, useLocation } from 'react-router-dom';

import DataContext from '../context/DataContext';
import { useContext, useEffect } from 'react';

import { motion } from 'framer-motion';

import Profile from "./profile/Profile";
import Menu from "./menu/Menu";
import RoseGrid from "./content/RoseGrid";
import AddRose from "./content/AddRose";
import Adjusting from "./menu-items/Adjusting";
import Collection from "./menu-items/Collection";
import RoseLayout from "./content/RoseLayout";

export default function Homepage() {

    const { loadRoses, setMessage } = useContext(DataContext)

    const location = useLocation()

    useEffect(() => {
        setMessage(null)
        loadRoses()
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <Profile/>
            <Menu/>
            <Routes>
                <Route path="/" element={<RoseGrid key={location.pathname}/>}/>
                <Route path="collection/" element={<Collection/>}/>
                <Route path="group/:groupName" element={<RoseGrid key={location.pathname}/>}/>
                <Route path="/search/" element={<RoseGrid key={location.pathname}/>}/>
                <Route path="addrose/" element={<AddRose/>}/>
                <Route path="adjusting/" element={<Adjusting/>}/>
                <Route path="/:roseId/*" element={<RoseLayout/>}/>
                {/* Добавьте другие маршруты по необходимости */}
            </Routes>
        </motion.div>
    )
}
