import { useContext } from 'react';
import * as Yup from 'yup';
import DataContext from '../../../context/DataContext';
import { GenericModule } from '../RoseModule';

const Pesticides = () => {
  const { pesticides } = useContext(DataContext);

  const fields = [
    {
      name: 'pesticide_id',
      label: 'Пестицид',
      type: 'select',
      options: pesticides.map((pesticide) => ({
        value: pesticide.id,
        label: pesticide.name,
      })),
    },
    {
      name: 'date_added',
      label: 'Дата обработки',
      type: 'date',
    },
  ];

  const validationSchema = Yup.object({
    pesticide_id: Yup.number().required('Выберите пестицид'),
    date_added: Yup.date().required('Обязательное поле'),
  });

  const customProductDisplay = (product) => (
    <div className="animate-fade-in form-partials">
      <div>
        <span className="label-partials">Пестицид: </span>
        {product.pesticide?.name}
      </div>
      <div>
        <span className="label-partials">Дата обработки: </span>
        {product.date_added}
      </div>
      {product.pesticide?.pests && product.pesticide.pests.length > 0 && (
        <div>
          <span className="label-partials">От вредителей: </span>
          {product.pesticide.pests.map(pest => pest.name).join(', ')}
        </div>
      )}
    </div>
  );

  return (
    <GenericModule
      title="Пестициды"
      apiEndpoint="pesticides"
      fields={fields}
      validationSchema={validationSchema}
      productType="применение пестицида"
      customProductDisplay={customProductDisplay}
    />
  );
};

const Fungicides = () => {
  const { fungicides } = useContext(DataContext);

  const fields = [
    {
      name: 'fungicide_id',
      label: 'Фунгицид',
      type: 'select',
      options: fungicides.map((fungicide) => ({
        value: fungicide.id,
        label: fungicide.name,
      })),
    },
    {
      name: 'date_added',
      label: 'Дата обработки',
      type: 'date',
    },
  ];

  const validationSchema = Yup.object({
    fungicide_id: Yup.number().required('Выберите фунгицид'),
    date_added: Yup.date().required('Обязательное поле'),
  });

  const customProductDisplay = (product) => (
    <div className="animate-fade-in form-partials">
      <div>
        <span className="label-partials">Фунгицид: </span>
        {product.fungicide?.name}
      </div>
      <div>
        <span className="label-partials">Дата обработки: </span>
        {product.date_added}
      </div>
      {product.fungicide?.fungi && product.fungicide.fungi.length > 0 && (
        <div>
          <span className="label-partials">От грибков: </span>
          {product.fungicide.fungi.map(fungus => fungus.name).join(', ')}
        </div>
      )}
    </div>
  );

  return (
    <GenericModule
      title="Фунгициды"
      apiEndpoint="fungicides"
      fields={fields}
      validationSchema={validationSchema}
      productType="применение фунгицида"
      customProductDisplay={customProductDisplay}
    />
  );
};

const MedControl = () => {
  return (
    <div className="space-y-6">
      <Pesticides />
      <Fungicides />
    </div>
  );
};

export default MedControl;
