import { useState, useContext, Fragment } from 'react';
import useAxios from '../../hooks/useAxios';
import DataContext from '../../context/DataContext';
import Dropdown from '../../utils/DropdownField';
import { useNotification } from '../../context/NotificationContext';

function AddRose() {
  const { api } = useAxios();
  const { showNotification } = useNotification();
  const { groups, breeders } = useContext(DataContext);

  const [selectedGroup, setSelectedGroup] = useState({ id: '', name: '' });
  const [selectedBreeder, setSelectedBreeder] = useState({ id: '', name: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    if (!selectedGroup.id) {
      showNotification('Пожалуйста, выберите группу');
      return;
    }

    if (!selectedBreeder.id) {
      showNotification('Пожалуйста, выберите селекционера');
      return;
    }

    formData.set('group', selectedGroup.id);
    formData.set('breeder', selectedBreeder.id);

    try {
      await api.post('roses/', formData);
      showNotification('Роза успешно создана');

      event.target.reset();
      setSelectedGroup({ id: '', name: '' });
      setSelectedBreeder({ id: '', name: '' });
    } catch (error) {
      if (error.response?.status === 400) {
        showNotification(`Роза с таким названием уже существует`);
      }
    }
  };

  const renderField = ({ label, name, type = 'text', isRequired = false }) => (
    <div className="w-full text-sm rounded-md p-2 mr-2">
      <label htmlFor={name} className="form-label font-bold inline-block min-w-[245px]">
        {label}:
      </label>
      <input
        type={type}
        name={name}
        maxLength={255}
        required={isRequired}
        className="form-input inline-block"
      />
    </div>
  );

  const renderDropdown = ({ label, value, onChange, options, isRequired = false }) => (
    <div className="w-full text-sm rounded-md p-2 mr-2">
      <label className="form-label font-bold inline-block min-w-[245px]">
        {label}:
      </label>
      <Dropdown
        value={value}
        onChange={onChange}
        options={options}
        className="w-full"
      />
    </div>
  );

  const fields = [
    { label: 'Название', name: 'title', isRequired: true },
    { label: 'Название на английском', name: 'title_eng', isRequired: true },
    { label: 'Стандартная ширина', name: 'const_width' },
    { label: 'Стандартная высота', name: 'const_height' },
    { label: 'Уязвимости', name: 'susceptibility' },
    { label: 'Дата посадки', name: 'landing_date', type: 'date' },
    { label: 'Главное фото', name: 'photo', type: 'file' },
  ];

  const textAreas = [
    { label: 'Описание', name: 'description' },
    { label: 'Наблюдение', name: 'observation' },
  ];

  return (
    <>
      <div className="animate-fade-in bg-amber-500 dotted-back p-5 rounded-3xl flex items-center justify-center">
        <div className="w-4/5">
          <div className="bg-rose-500 mx-auto text-white rounded-md flex items-center justify-center">
            <h2 className="text-4xl h-20 text-white flex items-center justify-center">
              ДОБАВИТЬ РОЗУ
            </h2>
          </div>
          <form method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <Fragment key={field.name}>{renderField(field)}</Fragment>
            ))}

            {renderDropdown({
              label: 'Группы',
              value: selectedGroup,
              onChange: setSelectedGroup,
              options: groups,
              isRequired: true,
            })}

            {renderDropdown({
              label: 'Селекционеры',
              value: selectedBreeder,
              onChange: setSelectedBreeder,
              options: breeders,
              isRequired: true,
            })}

            {textAreas.map(({ label, name }) => (
              <p className="w-full text-sm rounded-md p-2 mr-2" key={name}>
                <label className="form-label min-w-[245px]" htmlFor={name}>
                  {label}:
                </label>
                <textarea
                  name={name}
                  cols="40"
                  rows="5"
                  className="form-input inline-block"
                />
              </p>
            ))}
            <div className="flex items-center justify-center">
              <button type="submit" className="btn-red text-xl h-11">
                Создать
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddRose;
