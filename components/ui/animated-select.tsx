"use client"

import React from 'react'
import Select, { components, StylesConfig, GroupBase } from 'react-select'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface AnimatedSelectProps {
  options: Option[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  isDisabled?: boolean
}

const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown className="w-4 h-4 text-gray-400" />
    </components.DropdownIndicator>
  )
}

const customStyles: StylesConfig<Option, false, GroupBase<Option>> = {
  control: (provided, state) => ({
    ...provided,
    // Match Input component exactly
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    minHeight: '44px',
    height: '44px',
    // Focus state matching Input
    boxShadow: state.isFocused 
      ? '0 0 0 2px rgba(168, 85, 247, 0.5), 0 8px 16px rgba(168, 85, 247, 0.2)' 
      : 'none',
    borderColor: state.isFocused 
      ? 'rgba(192, 132, 252, 0.5)' 
      : 'rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    outline: 'none',
    // Hover state matching Input
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: state.isFocused ? 'rgba(192, 132, 252, 0.5)' : 'rgba(255, 255, 255, 0.3)',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '10px 16px', // Match Input component: px-4 py-2.5
    color: 'white',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
    fontSize: '14px', // Match Input text-sm
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'rgba(156, 163, 175, 0.7)',
    fontSize: '14px', // Match Input text-sm
    fontWeight: '400',
  }),
  input: (provided) => ({
    ...provided,
    color: 'white',
    fontSize: '14px', // Match Input text-sm
  }),
  // Ensure the portal wrapper floats above dialog overlays and can receive events
  menuPortal: (base) => ({
    ...base,
    zIndex: 100000,
    pointerEvents: 'auto',
  }),
  menu: (provided) => ({
    ...provided,
    // Match Input component styling
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    marginTop: '4px',
    animation: 'slideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 100001,
    pointerEvents: 'auto',
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '8px',
    maxHeight: '240px',
    '::-webkit-scrollbar': {
      width: '6px',
    },
    '::-webkit-scrollbar-track': {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
    },
    '::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '10px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(255, 255, 255, 0.4)',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? 'rgba(168, 85, 247, 0.3)' 
      : state.isFocused 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'transparent',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    margin: '2px 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: state.isSelected ? '600' : '400',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:active': {
      backgroundColor: 'rgba(168, 85, 247, 0.2)',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: 'rgba(156, 163, 175, 0.8)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    padding: '0 12px',
    '&:hover': {
      color: 'rgba(168, 85, 247, 1)',
    },
  }),
}

export function AnimatedSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  isDisabled = false,
}: AnimatedSelectProps) {
  const selectedOption = options.find(option => option.value === value) || null
  return (
    <div className={cn("relative", className)}>
      <Select
        options={options}
        value={selectedOption}
        onChange={(option) => onChange(option?.value || '')}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isSearchable={false}
        closeMenuOnScroll={false}
        styles={customStyles}
        components={{
          DropdownIndicator,
        }}
        // Render menu in a portal to escape clipping/overflow contexts
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        menuPlacement="auto"
        menuShouldScrollIntoView={false}
        classNamePrefix="animated-select"
      />
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animated-select__menu {
          animation: slideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Additional smooth transitions for select interactions */
        .animated-select__control {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .animated-select__option {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `}</style>
    </div>
  )
}

