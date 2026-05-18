import React from "react";
import '../../App.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text?: string;
    icon?: React.ReactNode;
    arrowicon?: React.ReactNode;
}

export default function Button({
    className = "",
    text,
    icon,
    arrowicon,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`
                relative flex items-center justify-between gap-3 
                bg-red-800 text-amber-100 rounded-2xl p-2 transition-all duration-200
                hover:bg-red-900 active:scale-95 w-full cursor-pointer
                shadow-md shadow-gray-950/10 border border-red-900/10
                ${className}
            `}
            {...props}
        >
            {icon && (
                <span className="shrink-0 text-red-900 text-md w-8 h-8 bg-red-100 headerinset rounded-full flex items-center justify-center">
                    {icon}
                </span>
            )}

            {text && (
                <span className="flex-1 text-left font-black text-xs uppercase tracking-wider truncate px-1">
                    {text}
                </span>
            )}

            {arrowicon && (
                <span className="shrink-0 text-red-200 text-base w-8 h-8 flex items-center justify-center transition-transform duration-200">
                    {arrowicon}
                </span>
            )}
        </button>
    );
}