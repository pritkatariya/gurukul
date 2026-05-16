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

  // લિસ્ટમાં જે સિલેક્ટ કરેલું હોય તેનું નામ બતાવવા માટે
  const selectedOption = options.find((opt) => opt.value === value);

  // ડ્રોપડાઉનની બહાર ક્લિક કરવાથી લિસ્ટ બંધ થઈ જાય તે માટે
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
      <label className="block text-sm font-medium text-gray-600 mb-1.5 transition-colors">
        {label}
      </label>

      {/* Custom Select Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 border rounded-xl bg-white flex justify-between items-center cursor-pointer transition-all duration-200 select-none shadow-sm ${
          isOpen 
            ? 'border-red-600 ring-4 ring-red-50/50' 
            : error 
            ? 'border-red-500' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow'
        }`}
      >
        <span className={`text-sm ${selectedOption ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        {/* Dropdown Arrow Indicator */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-600' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* --- HIGH UI SUGGESTION BOX (RED & WHITE THEME) --- */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-fadeIn transform origin-top transition-all duration-200 scale-100">
          <div className="p-1.5 bg-gray-50/50">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`flex items-center justify-between px-4 py-2.5 my-0.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md shadow-red-200' // Selected Item Style
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600' // Hover / Suggestion Style
                  }`}
                >
                  <span>{option.label}</span>
                  
                  {/* Selected Tick Mark */}
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
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium animate-slideDown">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}