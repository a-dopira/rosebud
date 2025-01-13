import { useState, useContext } from "react";
import DataContext from "../../context/DataContext";
import useAxios from "../../hooks/useAxios";
import Notification from "../../utils/Notification";
import { useNotification } from "../../hooks/useNotification";
import { Helmet } from 'react-helmet';
import { useParams } from "react-router-dom";
import * as Yup from 'yup';
import { useFormik } from 'formik'
import { motion } from "framer-motion";

const ProductForm = ({ product, onSubmit, setIsEditing }) => {
    const [foliage, setName] = useState(product.foliage);
    const [foliage_time, setDateAdded] = useState(product.foliage_time);

    const handleSubmit = (event) => {
        event.preventDefault();
        const productData = { foliage, foliage_time };
        onSubmit(productData);
        setIsEditing(false)
    };

    return (
        <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg" onSubmit={handleSubmit}
        >
            <label className="text-xl font-bold">
                Содержание:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="text" value={foliage} onChange={e => setName(e.target.value)} />
            <label className="text-xl font-bold">
                Дата обрезки обрезки:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="date" value={foliage_time} onChange={e => setDateAdded(e.target.value)} />
            <button type="submit" className="btn-red mt-2">Изменить</button>
        </motion.form>
    );
};

const Product = ({ product, productType, apiEndpoint }) => {
    const { setRose } = useContext(DataContext)
    const [isEditing, setIsEditing] = useState(false);
    const api = useAxios()
    const { notification, setNotificationMessage } = useNotification();

    const handleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleSubmit = async (updatedProduct) => {
        api.patch(`${apiEndpoint}/${product.id}/`, updatedProduct)
            .then(response => {
                setIsEditing(false);
                setNotificationMessage(`Обрезка успешно обновлена`);
                setRose(prevRose => {
                    const updatedProducts = prevRose[apiEndpoint].map((p) =>
                        p.id === response.data.id ? response.data : p
                    );
                    return { ...prevRose, [apiEndpoint]: updatedProducts };
                });
            });
    };
    
    const deleteProduct = async () => {
        api.delete(`/${apiEndpoint}/${product.id}/`)
        .then(response => {
            setNotificationMessage(`${response.data.name} успешно удален.`)
            setRose(prevState => ({...prevState, [apiEndpoint]: prevState[apiEndpoint].filter(prod => prod.id !== product.id)}))
            }
        )
        .catch(err => {
            setNotificationMessage(err.message)
        })
    };

    return (
        <div>
            {isEditing ? (
                <ProductForm product={product} onSubmit={handleSubmit} setIsEditing={setIsEditing}/>
            ) : (
                <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg">
                    <div className="mt-2">
                        <span className="text-xl font-bold">Содержание: </span> {product.foliage} 
                    </div>
                    <div className="mt-2">
                        <span className="text-xl font-bold">Добавлено: </span> {product.foliage_time}
                    </div>
                </motion.div>
            )}
            <button className="btn-red" onClick={handleEdit}>
                {isEditing ? 'Отменить' : 'Изменить'}
            </button>
            <button className="btn-red" onClick={deleteProduct}>Удалить</button>
            {notification && <Notification message={notification} />}
        </div>
    );
};

const NewProductForm = ({setRose, apiEndpoint, setShowForm}) => {
    const api = useAxios()
    const [notification, setNotification] = useState(null);
    const { roseId } = useParams()

    const validationSchema = Yup.object({
        foliage: Yup.string().required('Обязательное поле'),
        foliage_time: Yup.date().required('Обязательное поле'),
    });

    const formik = useFormik({
        initialValues: {
            foliage: '',
            foliage_time: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            const newProduct = { foliage: values.foliage, rose: roseId, foliage_time: values.foliage_time }
            await api.post(`/${apiEndpoint}/`, newProduct)
            .then(response => {
                setNotification('Обрезка успешна добавлена')
                setRose(prevState => ({...prevState, [apiEndpoint]: [...prevState[apiEndpoint], response.data]}))
                setShowForm(false)
            })
        },
    });

    return (
        <>
        <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            method="post" encType="multipart/form-data" onSubmit={formik.handleSubmit}
        >
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="foliage">Содержание:</label>
            <input type="text" name="foliage" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.foliage && formik.errors.foliage ? 'error' : ''}`} value={formik.values.foliage} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.foliage && formik.errors.foliage ? <div className="text-red-500">{formik.errors.foliage}</div> : null}
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="foliage_time" >Дата обрезки:</label>
            <input type="date" name="foliage_time" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.foliage_time && formik.errors.foliage_time ? 'error' : ''}`} value={formik.values.foliage_time} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.foliage_time && formik.errors.foliage_time ? <div className="text-red-500">{formik.errors.foliage_time}</div> : null}
            <button className="btn-red mt-2" type="submit">Добавить</button>
        </motion.form>
        { notification && <Notification message={notification} /> }
        </>
    );
};

const Foliage = () => {
    const { rose, setRose } = useContext(DataContext)

    const [showForm, setShowForm] = useState(false);

    return (
        <>
        <Helmet>
            <title>{rose.title} | Обрезки</title>
        </Helmet>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <h1 className="text-center text-2xl font-bold pb-2 border-b-2 border-gray-200">Обрезки</h1>
            <button className='btn-red my-2' onClick={() => setShowForm(!showForm)}>{showForm ? 'Скрыть' : 'Добавить'}</button>
            {showForm && <NewProductForm setRose={setRose} apiEndpoint={'foliages'} setShowForm={setShowForm}/>}
            {rose.foliages && rose.foliages.map((foliage) => (
                <Product key={foliage.id} productType={'обрезка'} product={foliage} apiEndpoint={'foliages'} />
            ))}

        </motion.div>
        </>
    )
}

export default Foliage

