import { useState, useCallback, useContext } from 'react';
import { Helmet } from 'react-helmet';
import AdjustForm from './AdjustForm';

import DataContext from '../../../context/DataContext';

function Adjusting() {
  const { groups, breeders, pests, fungi, pesticides, fungicides } =
    useContext(DataContext);

  const [values, setValues] = useState({
    groups: { id: '', name: '' },
    breeders: { id: '', name: '' },
    pests: { id: '', name: '' },
    fungi: { id: '', name: '' },
    pesticides: { id: '', name: '' },
    fungicides: { id: '', name: '' },
  });

  const setValue = useCallback((type, newValue) => {
    setValues((prev) => ({ ...prev, [type]: newValue }));
  }, []);

  const configData = [
    {
      type: 'groups',
      label: 'Настроить группу:',
      list: groups,
      endpoint: '/groups',
    },
    {
      type: 'breeders',
      label: 'Настроить селекционера:',
      list: breeders,
      endpoint: '/breeders',
    },
    {
      type: 'pests',
      label: 'Настроить вредителей:',
      list: pests,
      endpoint: '/pests',
    },
    {
      type: 'fungi',
      label: 'Настроить грибы:',
      list: fungi,
      endpoint: '/fungi',
    },
    {
      type: 'pesticides',
      label: 'Настроить пестициды:',
      list: pesticides,
      endpoint: '/pesticides',
      relatedEntities: pests,
      relationType: 'pests',
    },
    {
      type: 'fungicides',
      label: 'Настроить фунгициды:',
      list: fungicides,
      endpoint: '/fungicides',
      relatedEntities: fungi,
      relationType: 'fungi',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Настроить</title>
      </Helmet>
      <div className="animate-fade-in">
        {configData.map(
          ({ type, label, list, endpoint, relatedEntities, relationType }) => (
            <AdjustForm
              key={type}
              label={label}
              value={values[type]}
              setValue={(newValue) => setValue(type, newValue)}
              type={type}
              endpoint={endpoint}
              list={list}
              relatedEntities={relatedEntities}
              relationType={relationType}
            />
          )
        )}
      </div>
    </>
  );
}

export default Adjusting;
