import { useState, useContext } from "react";
import { useNotification } from "../../context/NotificationContext";
import { useParams } from "react-router-dom";
import { useFormik } from 'formik'
import RoseContext from "../../context/RoseContext";
import useAxios from "../../hooks/useAxios";
import * as Yup from 'yup';
import { Helmet } from 'react-helmet'
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
        <form 
            className="animate-fade-in my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg space-y-2" 
            onSubmit={handleSubmit}
        >
            <label className="text-xl font-bold">
                По листу:
            </label>
            <input className="inline-block form-input" type="text" value={leaf} onChange={e => setLeaf(e.target.value)} />
            <label className="text-xl font-bold">
                Дата прикормки:
            </label>
            <input className="inline-block form-input" type="date" value={leaf_time} onChange={e => setLeafTime(e.target.value)} />
            <label className="text-xl font-bold">
                По корню:
            </label>
            <input className="inline-block form-input" type="text" value={basal} onChange={e => setBasal(e.target.value)} />
            <label className="text-xl font-bold">
                Дата прикормки:
            </label>
            <input className="inline-block form-input" type="date" value={basal_time} onChange={e => setBasalTime(e.target.value)} />
            <button type="submit" className="btn-red mt-2">Изменить</button>
        </form>
    );
};

const Product = ({ product, productType, apiEndpoint }) => {

    const api = useAxios()

    const { setRose } = useContext(RoseContext)
    const { showNotification } = useNotification()

    const [isEditing, setIsEditing] = useState(false);
    const [modal, setShowModal] = useState(false)
    const [productId, setProductId] = useState(null)

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
                showNotification('Изменения успешно сохранены');
            })
            .catch(error => {
                showNotification('Произошла ошибка при сохранении изменений');
            });
    };

    return (
        <div>
            {isEditing ? (
                <ProductForm product={product} onSubmit={handleSubmit} />
            ) : (
                <div className="animate-fade-in my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg">
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
        </div>
    );
};
const NewProductForm = ({ setRose, apiEndpoint, setShowForm }) => {
    const api = useAxios();
    const { roseId } = useParams();
    const { showNotification } = useNotification();

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
                leaf_time: values.leaf_time,
            };
            await api.post(`/${apiEndpoint}/`, newProduct)
                .then(response => {
                    setRose(prevState => ({
                        ...prevState,
                        [apiEndpoint]: [...prevState[apiEndpoint], response.data],
                    }));
                    showNotification('Добавление прошло успешно.');
                    setShowForm(false);
                })
                .catch(err => {
                    showNotification(`Ошибка: ${err.message}`);
                });
        },
    });

    return (
        <form className="animate-fade-in" onSubmit={formik.handleSubmit}>
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
        </form>
    );
};

const Feeding = () => {
    const { rose, setRose } = useContext(RoseContext);
    const [showForm, setShowForm] = useState(false);

    return (
        <>
            <Helmet>
                <title>{ `${rose.title} | Подкормки` }</title>
            </Helmet>
            <div className="animate-fade-in">
                <h1 className="text-center text-2xl font-bold pb-2 border-b-2 border-gray-200">Подкормки</h1>
                <button className='btn-red my-2' onClick={() => setShowForm(!showForm)}>{showForm ? 'Скрыть' : 'Добавить'}</button>
                {showForm && 
                    <NewProductForm 
                        setRose={setRose} 
                        apiEndpoint={'feedings'} 
                        setShowForm={setShowForm}
                    />
                }
                {rose.feedings && rose.feedings.map((feeding) => (
                    <Product 
                        key={feeding.id} 
                        productType={'подкормка'} 
                        product={feeding} 
                        apiEndpoint={'feedings'}
                    />
                ))}
            </div>
        </>
    );
};

export default Feeding

