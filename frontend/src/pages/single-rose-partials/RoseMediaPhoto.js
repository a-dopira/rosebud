import { useState, useContext } from "react";
import useAxios from "../../hooks/useAxios";
import DataContext from "../../context/DataContext";
import { useNotification } from "../../context/NotificationContext";
import { useParams } from "react-router-dom";
import * as Yup from 'yup';
import { useFormik } from 'formik'
import DeleteNotificationModal from "../../utils/DeleteNotificationModal";

const ProductForm = ({ product, onSubmit }) => {
    const [descr, setDescr] = useState(product.descr);
    const [photo, setPhoto] = useState(product.photo);
    const [year, setYear] = useState(product.year);


    const handleSubmit = (event) => {
        event.preventDefault();
        const productData = { descr, photo, year };
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
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="file" value={photo} onChange={e => setPhoto(e.target.value)} />
            <label className="text-xl font-bold">
                Год:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="text" value={year} onChange={e => setYear(e.target.value)} />
            <button type="submit" className="btn-red mt-2">Изменить</button>
        </form>
    );
};

const Product = ({ product, productType, apiEndpoint }) => {
    
    const api = useAxios()
    
    const { setRose } = useContext(DataContext)
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
                showNotification('Произошла ошибка при сохранении изменений');
            })
    };

    return (
        <div>
            {isEditing ? (
                <ProductForm product={product} onSubmit={handleSubmit} />
            ) : (
                <div  className="animate-fade-in `my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg">
                    <div className="mt-2">
                        <span className="text-xl font-bold">Описание </span> {product.descr} 
                    </div>
                    <div className="mt-2">
                        <span className="text-xl font-bold">Фото: </span><img src={product.photo} alt={product.descr}/> 
                    </div>
                    <div className="mt-2">
                        <span className="text-xl font-bold">Год: </span> {product.year} 
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
                                (item) => item.id !== productId
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
    const { showNotification } = useNotification()

    const validationSchema = Yup.object({
        descr: Yup.string().required('Обязательное поле'),
        photo: Yup.mixed().required('Обязательное поле'),
        year: Yup.string().required('Обязательное поле'),
    });

    const formik = useFormik({
        initialValues: {
            descr: '',
            photo: '',
            year: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('rose', roseId);
            formData.append('descr', values.descr);
            formData.append('photo', values.photo);
            formData.append('year', values.year);
        
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            };
        
            await api.post(`/${apiEndpoint}/`, formData, config)
            .then(response => {
                setRose(prevState => ({
                    ...prevState, 
                    [apiEndpoint]: [...prevState[apiEndpoint], response.data]
                }))
                showNotification('Добавление прошло успешно.')
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
            method="post" 
            encType="multipart/form-data" 
            onSubmit={formik.handleSubmit}
        >
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="descr">Содержание:</label>
            <input type="text" name="descr" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.descr && formik.errors.descr ? 'error' : ''}`} value={formik.values.descr} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.descr && formik.errors.descr ? <div className="text-red-500">{formik.errors.descr}</div> : null}
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="photo" >Фото:</label>
            <input 
                type="file" 
                name="photo" 
                className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.photo && formik.errors.photo ? 'error' : ''}`} 
                onChange={(event) => {
                    formik.setFieldValue("photo", event.currentTarget.files[0]);
                }} 
                onBlur={formik.handleBlur} 
            />            
            {formik.touched.photo && formik.errors.photo ? <div className="text-red-500">{formik.errors.photo}</div> : null}
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="year">Год:</label>
            <input type="text" name="year" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.year && formik.errors.year ? 'error' : ''}`} value={formik.values.year} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.year && formik.errors.year ? <div className="text-red-500">{formik.errors.year}</div> : null}
            <button className="btn-red mt-2" type="submit">Добавить</button>
        </form>
        </>
    );
};

const RosePhoto = () => {

    const { rose, setRose } = useContext(DataContext)
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="animate-fade-in">
            <h1 className="text-center text-2xl font-bold pb-2 border-b-2 border-gray-200">Фотографии:</h1>
            <button className='btn-red my-2' onClick={() => setShowForm(!showForm)}>{showForm ? 'Скрыть' : 'Добавить'}</button>
            {showForm && <
                NewProductForm setRose={setRose} 
                apiEndpoint={'rosephotos'} 
                setShowForm={setShowForm}/>
            }
            {rose.rosephotos && rose.rosephotos.map((rosephoto) => (
                <Product 
                    key={rosephoto.id} 
                    productType={'фото'} 
                    product={rosephoto} 
                    apiEndpoint={'rosephotos'} 
                />
            ))}
        </div>
    )
}

export default RosePhoto