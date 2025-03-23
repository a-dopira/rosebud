import * as Yup from 'yup';
import { GenericModule } from '../RoseModule';


const RoseFeedings = () => {

    const fields = [
        { name: 'leaf', label: 'По листу', type: 'text' },
        { name: 'leaf_time', label: 'Дата прикормки', type: 'date' },
        { name: 'basal', label: 'По корню', type: 'text' },
        { name: 'basal_time', label: 'Дата прикормки', type: 'date' }
    ];

    const validationSchema = Yup.object({
        basal: Yup.string().required('Обязательное поле'),
        basal_time: Yup.date().required('Обязательное поле'),
        leaf: Yup.string().required('Обязательное поле'),
        leaf_time: Yup.date().required('Обязательное поле'),
    });

    return (
        <GenericModule
            title="Подкормки"
            apiEndpoint="feedings"
            dataKey="feedings"
            fields={fields}
            validationSchema={validationSchema}
            productType="подкормка"
        />
    );
};

export default RoseFeedings;