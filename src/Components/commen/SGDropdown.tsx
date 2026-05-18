import { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface SGDropdownProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options: DropdownOption[];
  placeholder?: string;
  error?: string;
  className?: string;
}

export default function SGDropdown({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = '-- Choose Option --',
  error,
  className = '',
}: SGDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div className={`w-full relative ${className}`} ref={dropdownRef}>
      
      <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 pl-1">
        {label}
      </label>

      <div
        tabIndex={0} 
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full h-14 px-4 rounded-2xl bg-white flex justify-between items-center cursor-pointer transition-all duration-150 select-none shadow-sm focus:outline-none ${
          isOpen 
            ? 'border-2 border-red-800 ring-4 ring-red-50' 
            : error 
            ? 'border-2 border-red-500 ring-4 ring-red-50' 
            : 'border border-gray-200 hover:border-gray-300 focus:border-2 focus:border-red-800 focus:ring-4 focus:ring-red-50 bg-gray-50/20' 
        }`}
      >
        <span className={`text-sm font-bold ${selectedOption ? 'text-gray-700' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-800' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute BrutalZIndex w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto transform origin-top transition-all duration-200 scale-100 p-1.5 z-50">
          <div className="bg-white space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  tabIndex={0} 
                  onClick={() => handleSelect(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(option.value);
                    }
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer outline-none focus:outline-none ${
                    isSelected
                      ? 'bg-red-800 text-white shadow-md border-2 border-red-800' 
                      : 'text-gray-600 border-2 border-transparent hover:border-red-800 hover:bg-red-50/60 hover:text-red-800 focus:border-2 focus:border-red-800 focus:bg-red-50/60 focus:text-red-800 focus:ring-2 focus:ring-red-100' 
                  }`}
                >
                  <span>{option.label}</span>
                  
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              );
            })}
            
            {options.length === 0 && (
              <div className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">No options available</div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1.5 pl-2">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}