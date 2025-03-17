import { Helmet } from 'react-helmet';
import * as Yup from 'yup';
import { GenericModule } from './RoseModule';


const Foliage = () => {

    const fields = [
        { name: 'foliage', label: 'Содержание', type: 'text' },
        { name: 'foliage_time', label: 'Дата обрезки', type: 'date' }
    ];

    const validationSchema = Yup.object({
        foliage: Yup.string().required('Обязательное поле'),
        foliage_time: Yup.date().required('Обязательное поле'),
    });

    return (
        <>
            <Helmet>
                <title>Обрезки</title>
            </Helmet>
            <GenericModule
                title="Обрезки"
                apiEndpoint="foliages"
                dataKey="foliages"
                fields={fields}
                validationSchema={validationSchema}
                productType="обрезка"
            />
        </>
    );
};

export default Foliage

