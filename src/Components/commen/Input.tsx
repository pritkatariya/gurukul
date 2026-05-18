import React from "react";

interface InputProps {
    label?: string;
    icon?: React.ReactNode;
    type?: "text" | "password" | "email" | "number"; 
    placeholder?: string;
    className?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
    label,
    icon, 
    type = 'text', 
    placeholder,
    className, 
    value, 
    onChange
}: InputProps) {
    return (
        <div className="group flex flex-col w-full gap-2 outline-none">
            {label && (
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider group-focus-within:text-red-800 transition-colors pl-1">
                    {label}
                </label>
            )}

            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-5 text-base top-1/2 -translate-y-1/2 text-red-800/50 group-focus-within:text-red-800 transition-colors z-10">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full h-14 pl-14 pr-4 focus:outline-none focus:ring-4 ring-red-50 text-sm rounded-2xl font-bold text-gray-700 shadow-sm transition-all border border-gray-200 focus:border-red-800 bg-gray-50/20 focus:bg-white ${className}`}
                />
            </div>
        </div>
    );
}