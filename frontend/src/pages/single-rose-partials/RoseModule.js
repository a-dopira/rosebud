import { useState, useContext } from 'react';
import RoseContext from '../../context/RoseContext';
import { GenericProduct } from '../../utils/RoseComponents/Product';
import { GenericNewProductForm } from '../../utils/RoseComponents/NewProductForm';
import { GenericModal } from '../../utils/RoseComponents/ModalProduct';


/**
 * Generic module component to be used for all different modules
 * @param {Object} props - Component props
 * @param {String} props.title - Module title
 * @param {String} props.apiEndpoint - API endpoint for the module
 * @param {Array} props.dataKey - Data key in the rose object
 * @param {Array} props.fields - Field configuration array
 * @param {Object} props.validationSchema - Yup validation schema
 * @param {String} props.productType - Type of product (for display)
 */

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
      <div className="animate-fade-in space-y-2">
        <h1 className="text-center label-partials border-b-2 border-gray-200">{title}</h1>
        <button className="btn-red" onClick={openAddModal}>
          Добавить
        </button>
        
        {rose[dataKey] && rose[dataKey].map((item) => (
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
  