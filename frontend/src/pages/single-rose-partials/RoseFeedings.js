import { useState, useContext } from "react";
import DataContext from "../../context/DataContext";
import useAxios from "../../hooks/useAxios";
import Notification from "../../utils/Notification";
import { useParams } from "react-router-dom";
import * as Yup from 'yup';
import { useFormik } from 'formik'
import { Helmet } from 'react-helmet'
import { motion } from "framer-motion";
import DeleteNotificationModal from "../../utils/DeleteNotificationModal";

const ProductForm = ({ product, onSubmit }) => {
    const [basal, setBasal] = useState(product.basal);
    const [basal_time, setBasalTime] = useState(product.basal_time);
    const [leaf, setLeaf] = useState(product.leaf);
    const [leaf_time, setLeafTime] = useState(product.leaf_time);

    const handleSubmit = (event) => {
        event.preventDefault();
        const productData = { basal, basal_time, leaf, leaf_time };
        onSubmit(productData);
    };

    return (
        <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg" onSubmit={handleSubmit}
        >
            <label className="text-xl font-bold">
                По листу:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="text" value={leaf} onChange={e => setLeaf(e.target.value)} />
            <label className="text-xl font-bold">
                Дата прикормки:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="date" value={leaf_time} onChange={e => setLeafTime(e.target.value)} />
            <label className="text-xl font-bold">
                По корню:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="text" value={basal} onChange={e => setBasal(e.target.value)} />
            <label className="text-xl font-bold">
                Дата прикормки:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="date" value={basal_time} onChange={e => setBasalTime(e.target.value)} />
            <button type="submit" className="btn-red mt-2">Изменить</button>
        </motion.form>
    );
};

const Product = ({ product, productType, apiEndpoint }) => {
    const { setRose } = useContext(DataContext)
    const [isEditing, setIsEditing] = useState(false);
    const api = useAxios()
    const [modal, setShowModal] = useState(false)
    const [productId, setProductId] = useState(null)
    const [notification, setNotification] = useState(null);

    const openModal = (id) => {
        setProductId(id);
        setShowModal(true);
    };

    const handleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleSubmit = async (updatedProduct) => {
        await api.patch(`${apiEndpoint}/${product.id}/`, updatedProduct)
            .then(response => {
                setIsEditing(false);
                setRose(prevRose => {
                    const updatedProducts = prevRose[apiEndpoint].map((p) =>
                        p.id === response.data.id ? response.data : p
                    );
                    return { ...prevRose, [apiEndpoint]: updatedProducts };
                });
            });
    };

    return (
        <div>
            {isEditing ? (
                <ProductForm product={product} onSubmit={handleSubmit} />
            ) : (
                <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg">
                    <div className="mt-2">
                        <span className="text-xl font-bold">По листу: </span> {product.leaf} 
                    </div>
                    <div className="mt-2">
                        <span className="text-xl font-bold">Добавлено: </span> {product.leaf_time}
                    </div>
                    <div className="mt-2">
                        <span className="text-xl font-bold">По корню: </span> {product.basal} 
                    </div>
                    <div className="mt-2">
                        <span className="text-xl font-bold">Добавлено: </span> {product.basal_time}
                    </div>
                </motion.div>
            )}
            <button className="btn-red" onClick={handleEdit}>
                {isEditing ? 'Отменить' : 'Изменить'}
            </button>
            <button className="btn-red" onClick={() => openModal(product.id)}>Удалить</button>
            {modal && (
                <DeleteNotificationModal
                    itemId={productId}
                    itemType={productType}
                    apiEndpoint={apiEndpoint}
                    setShowModal={setShowModal}
                    setNotification={setNotification}
                    updateState={prevState =>
                        setRose((prevRose) => ({
                            ...prevRose,
                            [apiEndpoint]: prevRose[apiEndpoint].filter(
                                (product) => product.id !== productId
                            ),
                        }))
                    }
                />
            )}
            {notification && <Notification message={notification} />}
        </div>
    );
};

const NewProductForm = ({setRose, apiEndpoint, setShowForm}) => {
    const api = useAxios()
    const [notification, setNotification] = useState(null);
    const { roseId } = useParams()

    const validationSchema = Yup.object({
        basal: Yup.string().required('Обязательное поле'),
        basal_time: Yup.date().required('Обязательное поле'),
        leaf: Yup.string().required('Обязательное поле'),
        leaf_time: Yup.date().required('Обязательное поле'),
    });

    const formik = useFormik({
        initialValues: {
            basal: '',
            basal_time: '',
            leaf: '',
            leaf_time: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            const newProduct = {  
                rose: roseId, 
                basal: values.basal, 
                basal_time: values.basal_time, 
                leaf: values.leaf, 
                leaf_time: values.leaf_time 
            }
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
        method="post" encType="multipart/form-data" onSubmit={formik.handleSubmit}>
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="basal">Содержание:</label>
            <input type="text" name="basal" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.basal && formik.errors.basal ? 'error' : ''}`} value={formik.values.basal} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.basal && formik.errors.basal ? <div className="text-red-500">{formik.errors.basal}</div> : null}
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="basal_time" >Дата обрезки:</label>
            <input type="date" name="basal_time" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.basal_time && formik.errors.basal_time ? 'error' : ''}`} value={formik.values.basal_time} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.basal_time && formik.errors.basal_time ? <div className="text-red-500">{formik.errors.basal_time}</div> : null}
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="leaf">Содержание:</label>
            <input type="text" name="leaf" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.leaf && formik.errors.leaf ? 'error' : ''}`} value={formik.values.leaf} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.leaf && formik.errors.leaf ? <div className="text-red-500">{formik.errors.leaf}</div> : null}
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="leaf_time" >Дата обрезки:</label>
            <input type="date" name="leaf_time" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.leaf_time && formik.errors.leaf_time ? 'error' : ''}`} value={formik.values.leaf_time} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.leaf_time && formik.errors.leaf_time ? <div className="text-red-500">{formik.errors.leaf_time}</div> : null}
            <button className="btn-red mt-2" type="submit">Добавить</button>
        </motion.form>
        { notification && <Notification message={notification} /> }
        </>
    );
};

const Feeding = () => {
    const { rose, setRose } = useContext(DataContext)

    const [showForm, setShowForm] = useState(false);

    return (
        <>
        <Helmet>
            <title>{rose.title} | Подкормки</title>
        </Helmet>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <h1 className="text-center text-2xl font-bold pb-2 border-b-2 border-gray-200">Подкормки</h1>
            <button className='btn-red my-2' onClick={() => setShowForm(!showForm)}>{showForm ? 'Скрыть' : 'Добавить'}</button>
            {showForm && <NewProductForm setRose={setRose} apiEndpoint={'feedings'} setShowForm={setShowForm}/>}
            {rose.feedings && rose.feedings.map((feeding) => (
                <Product key={feeding.id} productType={'подкормка'} product={feeding} apiEndpoint={'feedings'} />
            ))}

        </motion.div>
        </>
    )
}

export default Feeding

