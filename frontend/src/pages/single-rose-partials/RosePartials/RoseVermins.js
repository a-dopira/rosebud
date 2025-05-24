import { useContext } from 'react';
import * as Yup from 'yup';
import DataContext from '../../../context/DataContext';
import { GenericModule } from '../RoseModule';

const RelationshipModule = ({
  title,
  apiEndpoint,
  fieldName,
  fieldLabel,
  productType,
  relationOptions,
}) => {
  const fields = [
    {
      name: fieldName,
      label: fieldLabel,
      type: 'select',
      options: relationOptions,
    },
    {
      name: 'date_added',
      label: 'Дата обработки',
      type: 'date',
    },
  ];

  const validationSchema = Yup.object({
    [fieldName]: Yup.number().required('Обязательное поле'),
    date_added: Yup.date().required('Обязательное поле'),
  });

  const customProductDisplay = (product) => {
    const selectedProduct = relationOptions.find(
      (option) => option.value === product[fieldName]
    );

    return (
      <div className="animate-fade-in my-2 p-5 space-y-2 border-solid border-gray-300 border-[1px] rounded-lg">
        <div>
          <span className="label-partials">{fieldLabel}:</span>{' '}
          {selectedProduct ? selectedProduct.label : `ID: ${product[fieldName]}`}
        </div>

        {product.pests && product.pests.length > 0 && (
          <div>
            <span className="label-partials">Вредители:</span>{' '}
            {product.pests.map((pest) => pest.name).join(', ')}
          </div>
        )}

        {product.fungi && product.fungi.length > 0 && (
          <div>
            <span className="label-partials">Грибки:</span>{' '}
            {product.fungi.map((fungus) => fungus.name).join(', ')}
          </div>
        )}

        <div>
          <span className="label-partials">Дата обработки:</span> {product.date_added}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <GenericModule
        title={title}
        apiEndpoint={apiEndpoint}
        fields={fields}
        validationSchema={validationSchema}
        productType={productType}
        customProductDisplay={customProductDisplay}
      />
    </div>
  );
};

const Pesticides = () => {
  const { pesticides } = useContext(DataContext);

  return (
    <RelationshipModule
      title="Пестициды"
      apiEndpoint="rosepesticides"
      fieldName="pesticide"
      fieldLabel="Пестицид"
      productType="пестицид"
      relationOptions={pesticides.map((pesticide) => ({
        value: pesticide.id,
        label: pesticide.name,
      }))}
    />
  );
};

const Fungicides = () => {
  const { fungicides } = useContext(DataContext);

  return (
    <RelationshipModule
      title="Фунгициды"
      apiEndpoint="rosefungicides"
      fieldName="fungicide"
      fieldLabel="Фунгицид"
      productType="фунгицид"
      relationOptions={fungicides.map((fungicide) => ({
        value: fungicide.id,
        label: fungicide.name,
      }))}
    />
  );
};

const MedControl = () => {
  return (
    <>
      <Pesticides />
      <Fungicides />
    </>
  );
};

export default MedControl;
