import { useState, useContext } from "react";
import DataContext from "../../context/DataContext";
import useAxios from "../../utils/useAxios";
import Notification from "../../utils/Notification";
import DeleteProductModal from "../../utils/DeleteProductModal";
import { useParams } from "react-router-dom";
import * as Yup from 'yup';
import { useFormik } from 'formik'
import { motion } from "framer-motion";

const ProductForm = ({ product, onSubmit }) => {
    const [height, setHeight] = useState(product.height);
    const [width, setWidth] = useState(product.width);
    const [date_added, setDateAdded] = useState(product.date_added);

    const handleSubmit = (event) => {
        event.preventDefault();
        const productData = { height, width, date_added };
        onSubmit(productData);
    };

    return (
        <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg" 
            onSubmit={handleSubmit}
        >
            <label className="text-xl font-bold">
                Высота:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="text" value={height} onChange={e => setHeight(e.target.value)} />
            <label className="text-xl font-bold">
                Ширина
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="text" value={width} onChange={e => setWidth(e.target.value)} />
            <label className="text-xl font-bold">
                Дата замеров:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="date" value={date_added} onChange={e => setDateAdded(e.target.value)} />
            <button type="submit" className="btn-red mt-2">Изменить</button>
        </motion.form>
    );
};

const Product = ({ product, productType, apiEndpoint }) => {
    const { rose, setRose } = useContext(DataContext)
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
                    className="my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg"
                >
                    <div className="mt-2">
                        <span className="text-xl font-bold">Высота: </span> {product.height} Разница с постоянными: {+product.height - +rose.const_height}
                    </div>
                    <div className="mt-2">
                        <span className="text-xl font-bold">Ширина: </span> {product.width} Разница с постоянными: {+product.width - +rose.const_width}
                    </div>
                    <div className="mt-2">
                        <span className="text-xl font-bold">Добавлено: </span> {product.date_added}
                    </div>
                </motion.div>
            )}
            <button className="btn-red" onClick={handleEdit}>
                {isEditing ? 'Отменить' : 'Изменить'}
            </button>
            <button className="btn-red" onClick={() => openModal(product.id)}>Удалить</button>
            {modal && (
                <DeleteProductModal productId={productId} productType={productType} setShowModal={setShowModal} setNotification={setNotification} apiEndpoint={apiEndpoint} />
            )}
            {notification && <Notification message={notification} />}
        </div>
    );
};

const NewProductForm = ({setRose, apiEndpoint, setShowForm}) => {
    const api = useAxios()
    const [notification, setNotification] = useState(null);
    const { roseId } = useParams()

    console.log(roseId, typeof(roseId));

    const validationSchema = Yup.object({
        height: Yup.string().required('Обязательное поле'),
        width: Yup.string().required('Обязательное поле'),
        date_added: Yup.string().required('Обязательное поле'),
    });

    const formik = useFormik({
        initialValues: {
            height: '',
            width: '',
            date_added: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            const newProduct = {  rose: +roseId, height: values.height, width: values.width, date_added: values.date_added }
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
            method="post" 
            encType="multipart/form-data" 
            onSubmit={formik.handleSubmit}
        >
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="height">Высота:</label>
            <input type="text" name="height" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.height && formik.errors.height ? 'error' : ''}`} value={formik.values.height} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.height && formik.errors.height ? <div className="text-red-500">{formik.errors.height}</div> : null}
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="width">Ширина:</label>
            <input type="text" name="width" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.width && formik.errors.width ? 'error' : ''}`} value={formik.values.width} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.width && formik.errors.width ? <div className="text-red-500">{formik.errors.width}</div> : null}
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="date_added" >Дата замеров:</label>
            <input type="date" name="date_added" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.date_added && formik.errors.date_added ? 'error' : ''}`} value={formik.values.date_added} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.date_added && formik.errors.date_added ? <div className="text-red-500">{formik.errors.date_added}</div> : null}
            <button className="btn-red mt-2" type="submit">Добавить</button>
        </motion.form>
        { notification && <Notification message={notification} /> }
        </>
    );
};

const Sizes = () => {
    const { rose, setRose } = useContext(DataContext)

    const [showForm, setShowForm] = useState(false);

    return (
        <motion.div>
            <h1 className="text-center text-2xl font-bold pb-2 border-b-2 border-gray-200">Размеры</h1>
            <button className='btn-red my-2' onClick={() => setShowForm(!showForm)}>{showForm ? 'Скрыть' : 'Добавить'}</button>
            {showForm && <NewProductForm setRose={setRose} apiEndpoint={'sizes'} setShowForm={setShowForm}/>}
            {rose.sizes && rose.sizes.map((size) => (
                <Product key={size.id} productType={'размер'} product={size} apiEndpoint={'sizes'} />
            ))}

        </motion.div>
    )
}

export default Sizes

