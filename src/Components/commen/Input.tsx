import React from "react";

interface InputProps {
    label?: string; // નવું લેબલ પ્રોપ ઉમેર્યું
    icon?: React.ReactNode;
    type?: "text" | "password" | "email" | "number"; 
    placeholder?: string;
    className?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
    label, // લેબલ પ્રોપ અહીં ડીસ્ટ્રક્ચર કરી
    icon, 
    type = 'text', 
    placeholder, 
    className, 
    value, 
    onChange
}: InputProps) {
    return (
        <div className="group flex flex-col w-full gap-1.5 outline-none">
            {/* --- LABEL ELEMENT --- */}
            {label && (
                <label className="text-sm font-semibold text-gray-700 group-focus-within:text-red-700 transition-colors pl-1">
                    {label}
                </label>
            )}

            {/* Input & Icon Wrapper Container */}
            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-6 text-lg top-1/2 -translate-y-1/2 text-red-800/40 group-focus-within:text-red-700 transition-colors z-10">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full h-14 pl-16 pr-4 focus:outline-none focus:ring-4 ring-red-50 text-lg rounded-2xl font-bold text-gray-700 shadow-sm transition-all border border-gray-200 focus:border-red-700 ${className}`}
                />
            </div>
        </div>
    );
}