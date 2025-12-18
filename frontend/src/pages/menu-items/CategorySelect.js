import { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { DataContext } from '../../context/DataContext';

function CategorySelect() {
  const { groups } = useContext(DataContext);
  const navigate = useNavigate();

  const options = useMemo(
    () =>
      (groups || []).map((g) => ({
        value: g.name,
        label: `${g.name} (${g.rose_count})`,
      })),
    [groups]
  );

  return (
    <div className="w-[170px]">
      <Select
        value={null}
        options={options}
        placeholder="Категории"
        isSearchable={false}
        isClearable={false}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        onChange={(opt) => {
          if (!opt) return;
          navigate(`/home/group/${encodeURIComponent(opt.value)}`);
        }}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (base) => ({
            ...base,
            minHeight: 42,
            borderRadius: 6,
            borderColor: '#d1d5db',
            boxShadow: 'none',
          }),
          placeholder: (base) => ({
            ...base,
            color: '#111827',
            fontWeight: 600,
            fontSize: '1.125rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }),
          singleValue: (base) => ({ ...base, display: 'none' }),
          indicatorSeparator: (base) => ({ ...base, display: 'none' }),
        }}
      />
    </div>
  );
}

export default CategorySelect;
