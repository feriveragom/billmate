'use client';

import Select, { StylesConfig, GroupBase } from 'react-select';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectInputProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    isClearable?: boolean;
    isSearchable?: boolean;
    className?: string;
}

export default function SelectInput({
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    isClearable = true,
    isSearchable = true,
    className = ''
}: SelectInputProps) {
    const selectedOption = options.find(opt => opt.value === value) || null;

    // Estilos personalizados para mantener consistencia con el diseño de BillMate
    const customStyles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'hsl(var(--background))',
            borderColor: state.isFocused ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '2px 8px',
            boxShadow: 'none',
            '&:hover': {
                borderColor: 'hsl(var(--primary))',
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#ffffff', // Fondo blanco sólido
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
            zIndex: 1000,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        }),
        menuList: (provided) => ({
            ...provided,
            padding: 0,
            maxHeight: '200px',
            backgroundColor: '#ffffff', // Fondo blanco sólido
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? 'hsl(var(--primary) / 0.15)'
                : state.isFocused
                    ? 'rgba(0, 0, 0, 0.05)'
                    : 'transparent',
            color: state.isSelected ? 'hsl(var(--primary))' : '#1a1a1a',
            padding: '10px 16px',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: 'hsl(var(--primary) / 0.25)',
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'hsl(var(--foreground))',
        }),
        input: (provided) => ({
            ...provided,
            color: 'hsl(var(--foreground))',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: 'hsl(var(--foreground) / 0.5)',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: 'hsl(var(--foreground) / 0.5)',
            '&:hover': {
                color: 'hsl(var(--primary))',
            },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: 'hsl(var(--foreground) / 0.5)',
            '&:hover': {
                color: 'hsl(var(--primary))',
            },
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
    };

    return (
        <Select<SelectOption>
            value={selectedOption}
            onChange={(option) => onChange(option?.value || '')}
            options={options}
            placeholder={placeholder}
            isClearable={isClearable}
            isSearchable={isSearchable}
            styles={customStyles}
            className={className}
            classNamePrefix="react-select"
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            menuPosition="fixed"
        />
    );
}
