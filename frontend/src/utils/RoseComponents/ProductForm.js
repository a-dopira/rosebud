import { useFormik } from 'formik';


export const GenericProductForm = ({ 
  product, 
  onSubmit, 
  fields, 
  validationSchema,
}) => {
  const initialValues = {};
  fields.forEach(field => {
    initialValues[field.name] = product[field.name] || '';
  });
  
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form className="animate-fade-in form-partials" onSubmit={formik.handleSubmit}>
      {fields.map(field => (
        <div key={field.name} className="form-group">
          <label className="form-label" htmlFor={field.name}>
            {field.label}:
          </label>
          {field.type === 'file' ? (
            <input 
              type="file" 
              id={field.name}
              name={field.name} 
              className={`inline-block form-input ${formik.touched[field.name] && formik.errors[field.name] ? 'error' : ''}`}
              onChange={(e) => formik.setFieldValue(field.name, e.currentTarget.files[0])} 
              onBlur={formik.handleBlur} 
            />
          ) : field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              className={`${formik.touched[field.name] && formik.errors[field.name] ? 'error' : ''}`}
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
              id={field.name}
              name={field.name}
              className={`inline-block form-input ${formik.touched[field.name] && formik.errors[field.name] ? 'error' : ''}`}
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
      <button type="submit" className="btn-red mt-2">Изменить</button>
    </form>
  );
};

