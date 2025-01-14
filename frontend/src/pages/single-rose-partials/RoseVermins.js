import { useEffect, useContext, useState } from 'react';
import DataContext from '../../context/DataContext';
import { Helmet } from 'react-helmet';

import { NewProductForm, Product } from './Vermins';

const Pesticides = ({ rosePesticides }) => {
    const { pests, loadPests } = useContext(DataContext)

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadPests()
    }, [])


    return (
        <div className='animate-fade-in'>
            <h1 className="text-center text-2xl font-bold pb-2 border-b-2 border-gray-200">Инсектициды</h1>
            <button className='btn-red my-2' onClick={() => setShowForm(!showForm)}>{showForm ? 'Скрыть' : 'Добавить'}</button>
            {showForm && <NewProductForm vermins={pests} verminType={'вредителя'} apiEndpoint={'pesticides'} type={'pest'} setShowForm={setShowForm}/>}
            {rosePesticides && rosePesticides.map((pesticide) => (
                <Product key={pesticide.id} product={pesticide} apiEndpoint={'pesticides'} productType={'пестицид'} vermins={pests} type={'pest'}/>
            ))}

        </div>
    )
}

const Fungicides = ({ roseFungicides }) => {
    
    const { fungi, loadFungi, setRose } = useContext(DataContext)

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadFungi()
    }, [])

    return (
        <div className='animate-fade-in'>
            <h1 className="text-center text-2xl font-bold pb-2 border-b-2 border-gray-200">Фунгициды</h1>
            <button className='btn-red my-2' onClick={() => setShowForm(!showForm)}>{showForm ? 'Скрыть' : 'Добавить'}</button>
            {showForm && <NewProductForm vermins={fungi} verminType={'грибок'} setRose={setRose} apiEndpoint={'fungicides'} type={'fungicide'} setShowForm={setShowForm}/>}
            {roseFungicides && roseFungicides.map((fungicide) => (
                <Product key={fungicide.id} product={fungicide} apiEndpoint={'fungicides'} productType={'фунгицид'} vermins={fungi} type={'fungicide'}/>
            ))}
        </div>
    )
}

const MedControl = () => {

    const { rose } = useContext(DataContext)

    return (
        <>
            <Helmet>
                <title>{`${rose.title} | Вредители`}</title>
            </Helmet>
            <Pesticides rosePesticides={ rose.pesticides }/>
            <Fungicides roseFungicides={ rose.fungicides }/>
        </>
    )
}

export default MedControl
