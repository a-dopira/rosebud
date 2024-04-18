function FormField({ label, name, type="text", placeholder="Введите данные", options, register, errors }) {
    return (
        <>
            <label className="text-black inline-block min-w-[245px] text-2xl font-bold" htmlFor={name} {...register(name)}>{label}</label>
            {type === "select" ? (
                <select name={name} {...register(name)} className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full ">
                    {!options ? null : options.map(option => {
                        return name === 'group' ? (
                            <option key={option[0]} value={option[0]}>{option[1]}</option>
                        ) : <option key={option.id} value={option.id}>{option.name}</option>
                    })}
                </select>
            ) : type === "textarea" ? (
                <textarea name={name} cols="40" rows="5" className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"/>
            ) : (
                <input type={type} id={name} name={name} maxLength={255} placeholder={placeholder} className="inline-block border-2 p-2 mr-2 rounded-md text-black w-full"/>
            )}
            {errors[name] && <div className='text-red-900'>{errors[name].message}</div>}
        </>
    );
}

export default FormField