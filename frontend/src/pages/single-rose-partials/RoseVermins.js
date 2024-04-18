import { useEffect, useContext, useState } from 'react';
import DataContext from '../../context/DataContext';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

import { NewProductForm, Product } from './Vermins';

const Pesticides = () => {
    const { rose } = useContext(DataContext)
    const { pests, loadPests, setRose } = useContext(DataContext)

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadPests()
    }, [])


    return (
        <>
        <Helmet>
            <title>{rose.title} | Вредители</title>
        </Helmet>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <h1 className="text-center text-2xl font-bold pb-2 border-b-2 border-gray-200">Инсектициды</h1>
            <button className='btn-red my-2' onClick={() => setShowForm(!showForm)}>{showForm ? 'Скрыть' : 'Добавить'}</button>
            {showForm && <NewProductForm vermins={pests} verminType={'вредителя'} setRose={setRose} apiEndpoint={'pesticides'} type={'pest'} setShowForm={setShowForm}/>}
            {rose.pesticides && rose.pesticides.map((pesticide) => (
                <Product key={pesticide.id} product={pesticide} apiEndpoint={'pesticides'} productType={'пестицид'} vermins={pests} type={'pest'}/>
            ))}

        </motion.div>
        </>
    )
}

const Fungicides = () => {
    const { rose } = useContext(DataContext)
    const {fungi, loadFungi, setRose} = useContext(DataContext)

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadFungi()
    }, [])

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className='mt-5'
        >
            <h1 className="text-center text-2xl font-bold pb-2 border-b-2 border-gray-200">Фунгициды</h1>
            <button className='btn-red my-2' onClick={() => setShowForm(!showForm)}>{showForm ? 'Скрыть' : 'Добавить'}</button>
            {showForm && <NewProductForm vermins={fungi} verminType={'грибок'} setRose={setRose} apiEndpoint={'fungicides'} type={'fungicide'} setShowForm={setShowForm}/>}
            {rose.fungicides && rose.fungicides.map((fungicide) => (
                <Product key={fungicide.id} product={fungicide} apiEndpoint={'fungicides'} productType={'фунгицид'} vermins={fungi} type={'fungicide'}/>
            ))}

        </motion.div>
    )
}

const MedControl = () => {
    return (
        <>
            <Pesticides/>
            <Fungicides/>
        </>
    )
}

export default MedControl
