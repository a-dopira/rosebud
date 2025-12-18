import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

export default function DropdownSelect({
  value,
  options,
  onChange,
  placeholder = "Выберите...",
  isClearable = true,
  isDisabled = false,
  allowCreate = false,
  className = "",
}) {
  const Component = allowCreate ? CreatableSelect : Select;

  const rsValue = value?.id
    ? { value: value.id, label: value.name }
    : value?.name
      ? { value: "", label: value.name } // когда ввели новое, но id ещё нет
      : null;

  const rsOptions = (options || []).map((o) => ({
    value: o.id,
    label: o.name,
  }));

  const handleChange = (opt) => {
    if (!opt) return onChange({ id: "", name: "" });
    onChange({ id: opt.value ?? "", name: opt.label ?? "" });
  };

  const handleCreate = (input) => {
    const name = (input || "").trim();
    if (!name) return;
    // id пустой — это “новое значение”
    onChange({ id: "", name });
  };

  return (
    <div className={className}>
      <Component
        value={rsValue}
        options={rsOptions}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable
        isDisabled={isDisabled}
        onChange={handleChange}
        onCreateOption={allowCreate ? handleCreate : undefined}
        menuPortalTarget={document.body}
        // menuPosition="fixed"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),

          control: (base, state) => ({
            ...base,
            minHeight: 42,
            borderRadius: 6,
            borderColor: state.isFocused ? "#fb7185" : "#d1d5db", // rose-400 / gray-300
            boxShadow: "none",
          }),

          valueContainer: (base) => ({ ...base, padding: "0 10px" }),
          input: (base) => ({ ...base, margin: 0, padding: 0 }),
          indicatorsContainer: (base) => ({ ...base, height: 42 }),

          option: (base, state) => ({
            ...base,
            cursor: "pointer",
            backgroundColor: state.isFocused ? "#f3f4f6" : "white",
            color: "#111827",
          }),

          menu: (base) => ({ ...base, overflow: "hidden" }),
        }}
      />
    </div>
  );
}