import { useState, useContext } from 'react';
import RoseContext from '../../context/RoseContext';
import { GenericProduct } from '../../utils/RoseComponents/Product';
import { GenericNewProductForm } from '../../utils/RoseComponents/NewProductForm';
import { GenericModal } from '../../utils/RoseComponents/ModalProduct';
import { Helmet } from 'react-helmet';

export const GenericModule = ({
  title,
  apiEndpoint,
  dataKey,
  fields,
  validationSchema,
  productType,
  useFormData = false,
}) => {
  const { rose, setRose } = useContext(RoseContext);
  const [showAddModal, setShowAddModal] = useState(false);

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);

  return (
    <>
      <Helmet>
        <title>{`${rose.title} | ${title}`}</title>
      </Helmet>
      <div className="animate-fade-in space-y-2">
        <h1 className="text-center label-partials mt-5 border-b-2 border-gray-200">
          {title}
        </h1>
        <button className="btn-red" onClick={openAddModal}>
          Добавить
        </button>

        {rose[dataKey] &&
          rose[dataKey].map((item) => (
            <GenericProduct
              key={item.id}
              productType={productType}
              product={item}
              apiEndpoint={apiEndpoint}
              fields={fields}
              validationSchema={validationSchema}
              useFormData={useFormData}
            />
          ))}
      </div>

      <GenericModal
        isOpen={showAddModal}
        onClose={closeAddModal}
        title={`Добавить ${title}`}
        roseName={rose?.name}
      >
        <GenericNewProductForm
          setRose={setRose}
          apiEndpoint={apiEndpoint}
          setShowForm={closeAddModal}
          fields={fields}
          validationSchema={validationSchema}
          useFormData={useFormData}
        />
      </GenericModal>
    </>
  );
};
