import { useEffect, useContext } from "react"
import { Route, Routes, useParams } from "react-router-dom"
import RoseHeader from "../single-rose-partials/RoseHeader"
import RoseMenu from "../single-rose-partials/RoseMenu"
import MedControl from "../single-rose-partials/RoseVermins"
import Foliage from "../single-rose-partials/RoseFoliages"
import Feeding from "../single-rose-partials/RoseFeedings"
import RoseNote from "../single-rose-partials/RoseNote"
import RoseMedia from "../single-rose-partials/RoseMedia"

import DataContext from "../../context/DataContext"

function RoseLayout() {
    const { roseId } = useParams()

    const { loadRose } = useContext(DataContext)

    useEffect(() => {
        loadRose(roseId)
    }, [])

    return (
        <>
            <RoseHeader/>
            <RoseMenu/>
            <Routes>
                <Route path='medication' element={<MedControl/>}/>
                <Route path='foliage' element={<Foliage/>}/>
                <Route path='feedings' element={<Feeding/>}/>
                <Route path='notes' element={<RoseNote/>}/>
                <Route path='media' element={<RoseMedia/>}/>
            </Routes>
        </>
    )
}

export default RoseLayout