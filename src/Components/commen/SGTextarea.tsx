import React from "react";

interface SGTextareaProps {
    label?: string;
    icon?: React.ReactNode;
    placeholder?: string;
    className?: string;
    value?: string;
    rows?: number;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function SGTextarea({
    label,
    icon,
    placeholder,
    className,
    value,
    rows = 4,
    onChange
}: SGTextareaProps) {
    return (
        <div className="group flex flex-col w-full gap-2 outline-none">
            {label && (
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider group-focus-within:text-red-800 transition-colors pl-1">
                    {label}
                </label>
            )}

            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-5 text-base top-5 text-red-800/50 group-focus-within:text-red-800 transition-colors z-10">
                        {icon}
                    </div>
                )}

                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={rows}
                    className={`w-full py-4 pr-4 focus:outline-none focus:ring-4 ring-red-50 text-sm rounded-2xl font-bold text-gray-700 shadow-sm transition-all border border-gray-200 focus:border-red-800 bg-gray-50/20 focus:bg-white resize-y ${icon ? "pl-14" : "pl-4"
                        } ${className}`}
                />
            </div>
        </div>
    );
}