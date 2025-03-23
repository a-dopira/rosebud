import { useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import useAxios from '../../hooks/useAxios';
import { useNotification } from '../../context/NotificationContext';


export const GenericNewProductForm = ({ 
  setRose, 
  apiEndpoint, 
  setShowForm, 
  fields, 
  validationSchema,
  useFormData = false
}) => {
  const api = useAxios();
  const { roseId } = useParams();
  const { showNotification } = useNotification();

  const initialValues = {};
  fields.forEach(field => {
    initialValues[field.name] = '';
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        let data;
        let config = {};
        
        if (useFormData) {
          const formData = new FormData();
          formData.append('rose', roseId);
          
          Object.keys(values).forEach(key => {
            formData.append(key, values[key]);
          });
          
          data = formData;
          config = {
            headers: {
              'content-type': 'multipart/form-data'
            }
          };
        } else {
          data = {
            rose: roseId,
            ...values
          };
        }
        
        const response = await api.post(`/${apiEndpoint}/`, data, config);
        setRose(prevState => ({
          ...prevState,
          [apiEndpoint]: [...prevState[apiEndpoint], response.data]
        }));
        showNotification('Добавление прошло успешно');
        setShowForm(false);
      } catch (err) {
        showNotification(`Ошибка: ${err.message}`);
      }
    },
  });

  const handleFileChange = (event, fieldName) => {
    formik.setFieldValue(fieldName, event.currentTarget.files[0]);
  };

  return (
    <form 
      className="animate-fade-in form-partials space-y-2"
      method="post" 
      encType="multipart/form-data" 
      onSubmit={formik.handleSubmit}
    >
      {fields.map(field => (
        <div key={field.name} className="form-group">
          <label className="form-label" htmlFor={field.name}>
            {field.label}:
          </label>
          {field.type === 'file' ? (
            <input 
              type="file" 
              name={field.name} 
              className={`form-input ${formik.touched[field.name] && formik.errors[field.name] ? 'error' : ''}`}
              onChange={(e) => handleFileChange(e, field.name)} 
              onBlur={formik.handleBlur} 
            />
          ) : field.type === 'select' ? (
            <select
              name={field.name}
              className={`form-input ${formik.touched[field.name] && formik.errors[field.name] ? 'error' : ''}`}
              value={formik.values[field.name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Выберите {field.label.toLowerCase()}</option>
              {field.options && field.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input 
              type={field.type || 'text'} 
              name={field.name} 
              className={`form-input ${formik.touched[field.name] && formik.errors[field.name] ? 'error' : ''}`}
              value={formik.values[field.name]} 
              onChange={formik.handleChange} 
              onBlur={formik.handleBlur} 
            />
          )}
          <div className="error-container min-h-[24px]">
            {formik.touched[field.name] && formik.errors[field.name] ? (
              <div className="text-red-500">{formik.errors[field.name]}</div>
            ) : <div className="h-[24px]"></div>}
          </div>
        </div>
      ))}
      <button className="btn-red mt-2" type="submit">Добавить</button>
    </form>
  );
};