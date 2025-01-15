import { useState, useContext } from "react";
import useAxios from "../../hooks/useAxios";
import RoseContext from "../../context/RoseContext";
import { useNotification } from "../../context/NotificationContext";
import { useParams } from "react-router-dom";
import * as Yup from 'yup';
import { useFormik } from 'formik';
import DeleteNotificationModal from "../../utils/DeleteNotificationModal";

const ProductForm = ({ product, onSubmit }) => {
    const [descr, setDescr] = useState(product.descr);
    const [video, setVideo] = useState(product.video);


    const handleSubmit = (event) => {
        event.preventDefault();
        const productData = { descr, video };
        onSubmit(productData);
    };

    return (
        <form
            className="animate-fade-in my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg" 
            onSubmit={handleSubmit}
        >
            <label className="text-xl font-bold">
                Описание:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="text" value={descr} onChange={e => setDescr(e.target.value)} />
            <label className="text-xl font-bold">
                Выбрать файл:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="file" value={video} onChange={e => setVideo(e.target.value)} />
            <button type="submit" className="btn-red mt-2">Изменить</button>
        </form>
    );
};

const Product = ({ product, productType, apiEndpoint }) => {

    const api = useAxios()

    const { setRose } = useContext(RoseContext)
    const { showNotification } = useNotification();

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
                showNotification('Произошла ошибка при сохранении изменений');
            });
    };

    return (
        <div>
            {isEditing ? (
                <ProductForm product={product} onSubmit={handleSubmit} />
            ) : (
                <div className="animate-fade-in my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg">
                    <div className="mt-2">
                        <span className="text-xl font-bold">Описание </span> {product.descr} 
                    </div>
                    <div className="mt-2">
                        <span className="text-xl font-bold">Фото: </span><img src={product.video} alt={product.descr}/> 
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
                    updateState={(prevRose) =>
                        setRose((prevRose) => ({
                            ...prevRose,
                            [apiEndpoint]: prevRose[apiEndpoint].filter(
                                (product) =>product.id !== productId
                            ),
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
    const { showNotification } = useNotification();

    const validationSchema = Yup.object({
        descr: Yup.string().required('Обязательное поле'),
        video: Yup.date().required('Обязательное поле'),
    });

    const formik = useFormik({
        initialValues: {
            descr: '',
            video: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            const newProduct = {  
                rose: roseId, 
                descr: values.descr, 
                video: values.video 
            }
            await api.post(`/${apiEndpoint}/`, newProduct)
                .then(response => {
                    setRose(prevState => ({
                        ...prevState, 
                        [apiEndpoint]: [...prevState[apiEndpoint], response.data]
                    }))
                    showNotification('Добавление прошло успешно.');
                    setShowForm(false)
                })
                .catch(err => {
                    showNotification(`Ошибка: ${err.message}`)
                })
        },
    });

    return (
        <>
        <form 
            className="animate-fade-in"
            method="post" encType="multipart/form-data" 
            onSubmit={formik.handleSubmit}
        >
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="descr">Содержание:</label>
            <input type="text" name="descr" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.descr && formik.errors.descr ? 'error' : ''}`} value={formik.values.descr} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.descr && formik.errors.descr ? <div className="text-red-500">{formik.errors.descr}</div> : null}
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="video" >Видео:</label>
            <input type="file" name="video" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.video && formik.errors.video ? 'error' : ''}`} value={formik.values.video} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.video && formik.errors.video ? <div className="text-red-500">{formik.errors.video}</div> : null}
            <button className="btn-red mt-2" type="submit">Добавить</button>
        </form>
        </>
    );
};

const RoseVideo = () => {

    const { rose, setRose } = useContext(RoseContext)
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="animate-fade-in">
            <h1 className="text-center text-2xl font-bold pb-2 border-b-2 border-gray-200">Видео</h1>
            <button className='btn-red my-2' onClick={() => setShowForm(!showForm)}>{showForm ? 'Скрыть' : 'Добавить'}</button>
            {showForm && 
            <NewProductForm 
                setRose={setRose} 
                apiEndpoint={'videos'} 
                setShowForm={setShowForm}/>
            }
            {rose.videos && rose.videos.map((video) => (
                <Product 
                    key={video.id} 
                    productType={'видео'} 
                    product={video} 
                    apiEndpoint={'videos'} 
                />
            ))}

        </div>
    )
}

export default RoseVideo