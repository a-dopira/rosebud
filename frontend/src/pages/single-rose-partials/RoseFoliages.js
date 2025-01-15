import { useState, useContext } from "react";
import RoseContext from "../../context/RoseContext";
import useAxios from "../../hooks/useAxios";
import { useNotification } from "../../context/NotificationContext";
import { Helmet } from 'react-helmet';
import { useParams } from "react-router-dom";
import * as Yup from 'yup';
import { useFormik } from 'formik'
import DeleteNotificationModal from "../../utils/DeleteNotificationModal";

const ProductForm = ({ product, onSubmit }) => {
    const [foliage, setName] = useState(product.foliage);
    const [foliage_time, setDateAdded] = useState(product.foliage_time);

    const handleSubmit = (event) => {
        event.preventDefault();
        const productData = { foliage, foliage_time };
        onSubmit(productData);
    };

    return (
        <form 
            className="animate-fade-in my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg" 
            onSubmit={handleSubmit}
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
        </form>
    );
};

const Product = ({ product, productType, apiEndpoint }) => {
    const api = useAxios();

    const { setRose } = useContext(RoseContext);
    const { showNotification } = useNotification();

    const [isEditing, setIsEditing] = useState(false);
    const [modal, setShowModal] = useState(false);
    const [productId, setProductId] = useState(null);

    const handleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleSubmit = async (updatedProduct) => {
        try {
            const response = await api.patch(`${apiEndpoint}/${product.id}/`, updatedProduct);
            setIsEditing(false);
            setRose((prevRose) => {
                const updatedProducts = prevRose[apiEndpoint].map((p) =>
                    p.id === response.data.id ? response.data : p
                );
                return { ...prevRose, [apiEndpoint]: updatedProducts };
            });
            showNotification('Изменения успешно сохранены.');
        } catch (error) {
            showNotification('Произошла ошибка при сохранении изменений');
        }
    };

    const openModal = (id) => {
        setProductId(id);
        setShowModal(true);
    };

    return (
        <div>
            {isEditing ? (
                <ProductForm product={product} onSubmit={handleSubmit} />
            ) : (
                <div className="animate-fade-in my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg">
                    <div className="mt-2">
                        <span className="text-xl font-bold">Содержание: </span> {product.foliage}
                    </div>
                    <div className="mt-2">
                        <span className="text-xl font-bold">Добавлено: </span> {product.foliage_time}
                    </div>
                </div>
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
                    updateState={(prevState) =>
                        setRose((prevRose) => ({
                            ...prevRose,
                            [apiEndpoint]: prevRose[apiEndpoint].filter((item) => item.id !== productId),
                        }))
                    }
                />
            )}
        </div>
    );
};


const NewProductForm = ({ setRose, apiEndpoint, setShowForm }) => {

    const api = useAxios()
    const { roseId } = useParams()
    const { showNotification } = useNotification()

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
            const newProduct = { 
                foliage: values.foliage, 
                rose: roseId, 
                foliage_time: values.foliage_time 
            }
            await api.post(`/${apiEndpoint}/`, newProduct)
            .then(response => {
                setRose(prevState => ({
                    ...prevState, 
                    [apiEndpoint]: [...prevState[apiEndpoint], response.data]
                }))
                showNotification('Обрезка успешна добавлена')
                setShowForm(false)
            })
        },
    });

    return (
        <>
        <form 
            className="animate-fade-in"
            method="post" 
            encType="multipart/form-data" 
            onSubmit={formik.handleSubmit}
        >
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="foliage">Содержание:</label>
            <input type="text" name="foliage" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.foliage && formik.errors.foliage ? 'error' : ''}`} value={formik.values.foliage} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.foliage && formik.errors.foliage ? <div className="text-red-500">{formik.errors.foliage}</div> : null}
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="foliage_time" >Дата обрезки:</label>
            <input type="date" name="foliage_time" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.foliage_time && formik.errors.foliage_time ? 'error' : ''}`} value={formik.values.foliage_time} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.foliage_time && formik.errors.foliage_time ? <div className="text-red-500">{formik.errors.foliage_time}</div> : null}
            <button className="btn-red mt-2" type="submit">Добавить</button>
        </form>
        </>
    );
};

const Foliage = () => {

    const { rose, setRose } = useContext(RoseContext)
    const [showForm, setShowForm] = useState(false);

    return (
        <>
        <Helmet>
            <title>{`${rose.title} | Обрезки`}</title>
        </Helmet>
        <div className="animatep-fadeSlow">
            <h1 className="text-center text-2xl font-bold pb-2 border-b-2 border-gray-200">Обрезки</h1>
            <button className='btn-red my-2' onClick={() => setShowForm(!showForm)}>{showForm ? 'Скрыть' : 'Добавить'}</button>
            {showForm && 
                <NewProductForm 
                    setRose={setRose} 
                    apiEndpoint={'foliages'} 
                    setShowForm={setShowForm}
                />
            }
            {rose.foliages && rose.foliages.map((foliage) => (
                <Product 
                    key={foliage.id} 
                    productType={'обрезка'} 
                    product={foliage} 
                    apiEndpoint={'foliages'} 
                />
            ))}

        </div>
        </>
    )
}

export default Foliage

