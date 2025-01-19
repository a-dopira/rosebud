import { useEffect, useContext } from "react";
import RoseGrid from "../content/RoseGrid";
import DataContext from "../../context/RoseListContext";
// import useRosebud from "../../hooks/useRosebud";

function Collection() {
    const { loadRoses, setMessage } = useContext(DataContext);
    // const { loadRoses } = useRosebud();

    useEffect(() => {
        setMessage(null);
        loadRoses(1, null, null); // reset all filters
    }, []);

    return <RoseGrid />;
}

export default Collection;

