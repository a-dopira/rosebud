import { useContext } from 'react';
import { Helmet } from 'react-helmet';
import * as Yup from 'yup';
import RoseContext from '../../context/RoseContext';
import DataContext from '../../context/DataContext';
import { GenericModule } from './RoseModule';


const RelationshipModule = ({ 
  title,
  apiEndpoint,
  dataKey,
  relationType, 
  productType,
  relationTypeLabel,
  relationOptions
}) => {
  const fields = [
    { 
      name: 'name', 
      label: `Название ${productType}а`, 
      type: 'text' 
    },
    { 
      name: 'date_added', 
      label: `Дата обработки ${productType}а`, 
      type: 'date' 
    },
    { 
      name: `${relationType}_id`, 
      label: `${relationTypeLabel} для ${productType}а`, 
      type: 'select',
      options: relationOptions,
      renderDisplay: (product) => (
        <div className="mt-2">
          <span className="text-xl font-bold">
            {relationType === 'fungicide' ? 'Гриб' : 'Вредитель'}:
          </span> {product[relationType]?.name}
        </div>
      )
    }
  ];
  
  const validationSchema = Yup.object({
    name: Yup.string().required('Обязательное поле'),
    date_added: Yup.date().required('Обязательное поле'),
    [`${relationType}_id`]: Yup.string().required('Обязательное поле')
  });
  
  const customProductDisplay = (product) => {
    return (
      <div className="animate-fade-in my-2 p-5 border-solid border-gray-300 border-[1px] rounded-lg">
        <div className="mt-2">
          <span className="text-xl font-bold">
            {relationType === 'fungicide' ? 'Гриб' : 'Вредитель'}:
          </span> {product[relationType]?.name}
        </div>
        <div className="mt-2">
          <span className="text-xl font-bold">
            {relationType === 'fungicide' ? 'Фунгицид' : 'Пестицид'}:
          </span> {product.name}
        </div>
        <div className="mt-2">
          <span className="text-xl font-bold">Добавлено: </span> {product.date_added}
        </div>
      </div>
    );
  };
  
  return (
    <div className="animate-fade-in">
      <GenericModule
        title={title}
        apiEndpoint={apiEndpoint}
        dataKey={dataKey}
        fields={fields}
        validationSchema={validationSchema}
        productType={productType}
        customProductDisplay={customProductDisplay}
      />
    </div>
  );
};

const Pesticides = () => {
  const { pests } = useContext(DataContext);
  
  return (
    <RelationshipModule
      title="Инсектициды"
      apiEndpoint="pesticides"
      dataKey="pesticides"
      relationType="pest"
      productType="пестицид"
      relationTypeLabel="Вредитель"
      relationOptions={pests.map(pest => ({ 
        value: pest.id, 
        label: pest.name 
      }))}
    />
  );
};

const Fungicides = () => {
  const { fungi } = useContext(DataContext);
  
  return (
    <RelationshipModule
      title="Фунгициды"
      apiEndpoint="fungicides"
      dataKey="fungicides"
      relationType="fungicide"
      productType="фунгицид"
      relationTypeLabel="Гриб"
      relationOptions={fungi.map(fungus => ({ 
        value: fungus.id, 
        label: fungus.name 
      }))}
    />
  );
};

const MedControl = () => {
  const { rose } = useContext(RoseContext);

  return (
    <>
      <Helmet>
        <title>{`${rose.title} | Вредители`}</title>
      </Helmet>
      <Pesticides />
      <Fungicides />
    </>
  );
};

export default MedControl;
