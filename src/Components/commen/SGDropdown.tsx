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
      {/* Label */}
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>

      {/* Custom Select Button */}
      <div
        tabIndex={0} 
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full p-3 rounded-xl bg-white flex justify-between items-center cursor-pointer transition-all duration-150 select-none shadow-sm focus:outline-none ${
          isOpen 
            ? 'border-2 border-red-600 ring-4 ring-red-100' 
            : error 
            ? 'border-2 border-red-500 ring-4 ring-red-50' 
            : 'border border-gray-200 hover:border-gray-300 focus:border-2 focus:border-red-600 focus:ring-4 focus:ring-red-100 hover:shadow-md' 
        }`}
      >
        <span className={`text-sm ${selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-600' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* --- SUGGESTION BOX WITH OPTION OUTLINE/RING --- */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto transform origin-top transition-all duration-200 scale-100">
          <div className="p-2 bg-white space-y-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  tabIndex={0} // 💡 આનાથી લિસ્ટના ઓપ્શન પર પણ Tab અને Focus જશે
                  onClick={() => handleSelect(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(option.value);
                    }
                  }}
                  // 💡 focus: અને hover: બંનેમાં લાલ બોર્ડર અને રીંગ સેટ કરી દીધી છે
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer outline-none focus:outline-none ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md border-2 border-red-600' // Selected Item
                      : 'text-gray-700 border-2 border-transparent hover:border-red-600 hover:bg-red-50 hover:text-red-700 focus:border-2 focus:border-red-600 focus:bg-red-50 focus:text-red-700 focus:ring-2 focus:ring-red-200' // 💡 આ ઓપ્શન પર આઉટલાઇન/રીંગ લાવશે
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
              <div className="p-4 text-center text-sm text-gray-400">No options available</div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1 font-medium">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}