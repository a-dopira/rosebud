import { useContext, useEffect } from "react";
import DataContext from "../../context/DataContext";
import RoseGrid from "../content/RoseGrid";

function Collection() {
    const { loadRoses, setMessage } = useContext(DataContext);

    useEffect(() => {
        setMessage(null)
        loadRoses();
    }, []);

    return <RoseGrid />;
}

export default Collection;

