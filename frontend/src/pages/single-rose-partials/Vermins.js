import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from 'formik'
import { useNotification } from "../../context/NotificationContext";
import DeleteNotificationModal from "../../utils/DeleteNotificationModal";
import useAxios from "../../hooks/useAxios";
import RoseContext from "../../context/RoseContext";
import * as Yup from 'yup';

const ProductForm = ({ product, onSubmit, productType, vermins, type }) => {
    const [name, setName] = useState(product.name);
    const [date_added, setDateAdded] = useState(product.date_added);
    const [vermin, setVermin] = useState(product[type]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const productData = { name, date_added };
        productData[`${type}_id`] = vermin.id;
        onSubmit(productData);
    };

    const setNewVermin = (id) => {
        const newVermin = vermins.find(vermin => vermin.id === Number(id))
        setVermin(newVermin)
    }

    return (
        <form
            className="animate-fade-in my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg" 
            onSubmit={handleSubmit}
        >
            <label className="text-xl font-bold">
                Название {productType}а:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="text" value={name} onChange={e => setName(e.target.value)} />
            <label className="text-xl font-bold">
                Дата обработки {productType}а:
            </label>
            <input className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" type="date" value={date_added} onChange={e => setDateAdded(e.target.value)} />
            <label className="text-xl font-bold">
                Выбрать вредителя для {productType}а:
            </label>
            <select className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full" defaultValue={product[type].id} onChange={e => setNewVermin(e.target.value)}>
                    {vermins.map(vermin => (
                        <option key={vermin.id} value={vermin.id}>{vermin.name}</option>
                    ))}
                </select>
            <button type="submit" className="btn-red mt-2">Изменить {productType}</button>
        </form>
    );
};

const Product = ({ product, productType, apiEndpoint, vermins, type }) => {
    
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
                <ProductForm product={product} onSubmit={handleSubmit} productType={productType} vermins={vermins} type={type}/>
            ) : (
                <div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="animate-fade-in my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg"
                >
                    <div className="mt-2">
                        <span className="text-xl font-bold">{type === 'fungicide' ? 'Гриб' : 'Вредитель'}:</span> {product[type].name } 
                    </div>
                    <div className="mt-2">
                        <span className="text-xl font-bold">{type === 'fungicide' ? 'Фунгицид' : 'Пестицид'}:</span> {product.name} 
                    </div>
                    <div className="mt-2">
                        <span className="text-xl font-bold"> Добавлено: </span> {product.date_added}
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

const NewProductForm = ({vermins, type, verminType, apiEndpoint, setShowModal}) => {

    const api = useAxios()

    const { setRose } = useContext(RoseContext)
    const { showNotification } = useNotification()
    
    const { roseId } = useParams()

    const validationSchema = Yup.object({
        name: Yup.string().required('Обязательное поле'),
        date_added: Yup.date().required('Обязательное поле'),
        vermin: Yup.string().required('Обязательное поле'),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            date_added: '',
            vermin: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            const newProduct = { 
                name: values.name, 
                rose: roseId, 
                date_added: values.date_added 
            }

            newProduct[`${type}_id`] = values.vermin

            await api.post(`/${apiEndpoint}/`, newProduct)
            .then(response => {
                showNotification('Добавление прошло успешно.');
                setRose(prevState => ({...prevState, [apiEndpoint]: [...prevState[apiEndpoint], response.data]}))
                setShowModal(false)
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
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="name">Название:</label>
            <input type="text" name="name" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.name && formik.errors.name ? 'error' : ''}`} value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.name && formik.errors.name ? <div className="text-red-500">{formik.errors.name}</div> : null}
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor="date_added" >Дата обработки:</label>
            <input type="date" name="date_added" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.date_added && formik.errors.date_added ? 'error' : ''}`} value={formik.values.date_added} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {formik.touched.date_added && formik.errors.date_added ? <div className="text-red-500">{formik.errors.date_added}</div> : null}
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" >Выбрать:</label>
            <select name="vermin" className={`inline-block border-2 p-2 mr-2 rounded-md text-black w-full ${formik.touched.vermin && formik.errors.vermin ? 'error' : ''}`} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                <option key={Object.keys(vermins).length}>Выберите {verminType}</option>
                {vermins.map((vermin) => (
                    <option key={vermin.id} value={vermin.id}>{vermin.name}</option>
                ))}
            </select>
            {formik.touched.vermin && formik.errors.vermin ? <div className="text-red-500">{formik.errors.vermin}</div> : null}
            <button className="btn-red mt-2" type="submit">Добавить</button>
        </form>
        </>
    );
};

export { NewProductForm, Product }

