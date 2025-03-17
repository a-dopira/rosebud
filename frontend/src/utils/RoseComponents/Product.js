import { useState, useContext } from 'react';
import useAxios from '../../hooks/useAxios';
import RoseContext from '../../context/RoseContext';
import { useNotification } from '../../context/NotificationContext';
import { GenericProductForm } from './ProductForm';
import { GenericModal } from './ModalProduct';

/**
 * Generic Product component that can be used for all product types
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {String} props.productType - Type of product (for display and deletion)
 * @param {String} props.apiEndpoint - API endpoint for the product
 * @param {Array} props.fields - Field configuration array
 */

export const GenericProduct = ({ 
    product, 
    productType, 
    apiEndpoint, 
    fields, 
    validationSchema,
  }) => {
    const api = useAxios();
    const { setRose } = useContext(RoseContext);
    const { showNotification } = useNotification();
  
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
    const openEditModal = () => setIsEditModalOpen(true);
    const closeEditModal = () => setIsEditModalOpen(false);
    
    const openDeleteModal = () => setIsDeleteModalOpen(true);
    const closeDeleteModal = () => setIsDeleteModalOpen(false);
  
    const handleSubmit = async (updatedProduct) => {
      try {
        const response = await api.patch(`${apiEndpoint}/${product.id}/`, updatedProduct);
        closeEditModal();
        setRose(prevRose => {
          const updatedProducts = prevRose[apiEndpoint].map((p) =>
            p.id === response.data.id ? response.data : p
          );
          return { ...prevRose, [apiEndpoint]: updatedProducts };
        });
        showNotification('Изменения успешно сохранены');
      } catch (error) {
        showNotification('Произошла ошибка при сохранении изменений');
      }
    };
  
    const handleDelete = async () => {
      try {
        await api.delete(`${apiEndpoint}/${product.id}/`);
        closeDeleteModal();
        setRose((prevRose) => ({
          ...prevRose,
          [apiEndpoint]: prevRose[apiEndpoint].filter(
            (item) => item.id !== product.id
          ),
        }));
        showNotification('Успешно удалено');
      } catch (error) {
        showNotification('Произошла ошибка при удалении');
      }
    };
  
    const renderField = (field) => {
      if (field.type === 'image') {
        return (
          <div key={field.name}>
            <span className="label-partials">{field.label}: </span>
            <img src={product[field.name]} alt={product.descr || 'Изображение'} />
          </div>
        );
      }
      
      if (field.showDifference && field.differenceTo) {
        return (
          <div key={field.name}>
            <span className="label-partials">{field.label}: </span> 
            {product[field.name]} Разница с постоянными: {Math.round(+product[field.name] - +field.differenceTo, -2)}
          </div>
        );
      }
  
      if (field.type === 'select' && field.renderDisplay) {
        return field.renderDisplay(product);
      }
  
      return (
        <div key={field.name}>
          <span className="label-partials">{field.label}: </span> {product[field.name]}
        </div>
      );
    };
  
    return (
      <div className="space-y-2">
        <div className="animate-fade-in form-partials">
          {fields.map(field => renderField(field))}
        </div>
        
        <button className="btn-red mr-2" onClick={openEditModal}>Изменить</button>
        <button className="btn-red" onClick={openDeleteModal}>Удалить</button>
        
        {/* Edit Modal */}
        <GenericModal 
          isOpen={isEditModalOpen} 
          onClose={closeEditModal} 
          title="Редактировать"
          roseName={product?.rose_name}
        >
          <GenericProductForm 
            product={product} 
            onSubmit={handleSubmit} 
            fields={fields}
            validationSchema={validationSchema}
          />
        </GenericModal>
        
        {/* Delete Confirmation Modal */}
        <GenericModal 
          isOpen={isDeleteModalOpen} 
          onClose={closeDeleteModal} 
          title="Подтверждение удаления"
          roseName={product?.rose_name}
        >
          <div className="text-center">
            <p className="mb-4">Вы уверены, что хотите удалить этот {productType}?</p>
            <div className="flex justify-center space-x-4">
              <button className="btn-red" onClick={handleDelete}>Удалить</button>
              <button className="btn-gray" onClick={closeDeleteModal}>Отмена</button>
            </div>
          </div>
        </GenericModal>
      </div>
    );
  };