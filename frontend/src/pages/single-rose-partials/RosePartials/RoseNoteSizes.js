import { useContext } from 'react';
import * as Yup from 'yup';
import { GenericModule } from '../RoseModule';
import RoseContext from '../../../context/RoseContext';

const RoseNoteSizes = () => {
    
    const { rose } = useContext(RoseContext);
    
    const fields = [
        { 
            name: 'height', 
            label: 'Высота', 
            type: 'text',
            showDifference: true,
            differenceTo: rose.const_height
        },
        { 
            name: 'width', 
            label: 'Ширина', 
            type: 'text',
            showDifference: true,
            differenceTo: rose.const_width
        },
        { name: 'date_added', label: 'Дата замеров', type: 'date' }
    ];

    const validationSchema = Yup.object({
        height: Yup.string().required('Обязательное поле'),
        width: Yup.string().required('Обязательное поле'),
        date_added: Yup.date().required('Обязательное поле'),
    });

    return (
        <GenericModule
            title="Размеры"
            apiEndpoint="sizes"
            dataKey="sizes"
            fields={fields}
            validationSchema={validationSchema}
            productType="размер"
        />
    );
};

export default RoseNoteSizes;

