function FormField({
  label,
  name,
  type = 'text',
  placeholder = 'Введите данные',
  options,
  register,
  errors,
}) {
  return (
    <>
      <label
        className="form-label inline-block min-w-[245px] space-x-2"
        htmlFor={name}
        {...register(name)}
      >
        {label}
      </label>
      {type === 'select' ? (
        <select name={name} {...register(name)} className="form-input inline-block">
          {!options
            ? null
            : options.map((option) => {
                return name === 'group' ? (
                  <option key={option[0]} value={option[0]}>
                    {option[1]}
                  </option>
                ) : (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                );
              })}
        </select>
      ) : type === 'textarea' ? (
        <textarea name={name} cols="40" rows="5" className="form-input inline-block" />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          maxLength={255}
          placeholder={placeholder}
          className="form-input inline-block"
        />
      )}
      {errors[name] && <div className="text-red-900">{errors[name].message}</div>}
    </>
  );
}

export default FormField;
