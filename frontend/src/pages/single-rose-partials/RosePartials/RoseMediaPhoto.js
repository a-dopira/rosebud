import * as Yup from 'yup';
import { GenericModule } from "../RoseModule";
import { Helmet } from "react-helmet";

const RosePhoto = () => {

    const fields = [
        { name: 'descr', label: 'Описание', type: 'text' },
        { name: 'photo', label: 'Фото', type: 'file' },
        { name: 'year', label: 'Год', type: 'text' }
    ];

    const validationSchema = Yup.object({
        descr: Yup.string().required('Обязательное поле'),
        photo: Yup.mixed().required('Обязательное поле'),
        year: Yup.string().required('Обязательное поле'),
    });

    return (
        <>
            <Helmet>
                <title>Фотографии</title>
            </Helmet>
            <GenericModule
                title="Фотографии"
                apiEndpoint="rosephotos"
                dataKey="rosephotos"
                fields={fields}
                validationSchema={validationSchema}
                productType="фото"
                useFormData={true}
            />
        </>
    );
};

export default RosePhoto;