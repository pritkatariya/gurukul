import React from "react";

interface InputProps {
    icon?: React.ReactNode;
    type?: "text" | "password" | "email" | "number"; 
    placeholder?: string;
    className?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
    icon, 
    type = 'text', 
    placeholder, 
    className, 
    value, 
    onChange
}: InputProps) {
    return (
        <div className={`group relative outline-none w-full`}>
            {icon && (
                <div className="absolute left-7 text-lg top-1/2 -translate-y-1/2 text-red-800/40 group-focus-within:text-red-800 transition-colors z-10">
                    {icon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full pl-16 pr-4 focus:outline-none focus:ring-2 ring-red-400 text-lg rounded-2xl font-bold text-gray-700 shadow-sm transition-all ${className}`}
            />
        </div>
    );
}