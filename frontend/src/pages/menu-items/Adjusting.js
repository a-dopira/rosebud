import { useState, useCallback, useContext } from 'react';
import { Helmet } from 'react-helmet';
import AdjustForm from './AdjustForm';

import DataContext from '../../context/DataContext';

function Adjusting() {
  const { groups, breeders, pests, fungi, updateData } = useContext(DataContext);

  const [values, setValues] = useState({
    groups: { id: '', name: '' },
    breeders: { id: '', name: '' },
    pests: { id: '', name: '' },
    fungi: { id: '', name: '' },
  });

  const setValue = useCallback((type, newValue) => {
    setValues((prev) => ({
      ...prev,
      [type]: newValue,
    }));
  }, []);

  const configData = [
    {
      type: 'groups',
      label: 'Настроить группу:',
      list: groups,
      endpoint: 'groups/',
    },
    {
      type: 'breeders',
      label: 'Настроить селекционера:',
      list: breeders,
      endpoint: 'breeders/',
    },
    {
      type: 'pests',
      label: 'Настроить вредителей:',
      list: pests,
      endpoint: 'pests/',
    },
    {
      type: 'fungi',
      label: 'Настроить грибы:',
      list: fungi,
      endpoint: 'fungi/',
    },
  ];

  return (
    <>
      <Helmet>
        <title>{'Настроить'}</title>
      </Helmet>
      <div className="">
        {configData.map(({ type, label, list, endpoint }) => (
          <AdjustForm
            key={type}
            label={label}
            value={values[type]}
            setValue={(newValue) => setValue(type, newValue)}
            list={list}
            endpoint={endpoint}
            setList={(newList) => updateData(type, newList)}
            type={type}
          />
        ))}
      </div>
    </>
  );
}

export default Adjusting;
