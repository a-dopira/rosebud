import { Helmet } from 'react-helmet';
import * as Yup from 'yup';
import { GenericModule } from '../RoseModule';

const RoseVideo = () => {

    const fields = [
        { name: 'descr', label: 'Описание', type: 'text' },
        { name: 'video', label: 'Видео', type: 'file' }
    ];

    const validationSchema = Yup.object({
        descr: Yup.string().required('Обязательное поле'),
        video: Yup.mixed().required('Обязательное поле')
    });

    return (
        <>
            <Helmet>
                <title>Видео</title>
            </Helmet>
            <GenericModule
                title="Видео"
                apiEndpoint="videos"
                dataKey="videos"
                fields={fields}
                validationSchema={validationSchema}
                productType="видео"
                useFormData={true}
            />
        </>
    );
};

export default RoseVideo