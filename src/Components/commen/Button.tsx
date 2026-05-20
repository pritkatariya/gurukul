import React from "react";
import '../../App.css';
import { FaCloudUploadAlt } from "react-icons/fa"; // 🎯 એનિમેશન આઇકોન ઇમ્પોર્ટ કર્યો

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text?: string;
    icon?: React.ReactNode;
    arrowicon?: React.ReactNode;
    isLoading?: boolean;       // 🎯 નવો ઓપ્શન: લોડિંગ સ્ટેટ માટે
    loadingText?: string;     // 🎯 નવો ઓપ્શન: લોડિંગ વખતે બતાવવાનો ટેક્સ્ટ
}

export default function Button({
    className = "",
    text,
    icon,
    arrowicon,
    isLoading = false,        // 🎯 ડિફોલ્ટ false રાખ્યું જેથી જૂના બટન બગડે નહીં
    loadingText = "Uploading...",
    ...props
}: ButtonProps) {
    return (
        <button
            // 🎯 જો લોડિંગ ચાલુ હોય તો ડિસેબલ કલર્સ ઓટોમેટિક એપ્લાય થશે
            className={`
                relative flex items-center justify-between gap-3 
                rounded-2xl p-2 transition-all duration-300 w-full
                shadow-md shadow-gray-950/10 border
                ${isLoading 
                    ? "bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed transform-none" 
                    : "bg-red-800 text-amber-100 hover:bg-red-900 active:scale-95 cursor-pointer border-red-900/10"
                }
                ${className}
            `}
            disabled={isLoading || props.disabled} // 🎯 લોડિંગ વખતે બટન આપોઆપ ડિસેબલ થઈ જશે
            {...props}
        >
            {/* 🎯 જો લોડિંગ હોય તો સ્મૂથ બાઉન્સ થતો ક્લાઉડ આઇકોન દેખાશે, નહીં તો નોર્મલ આઇકોન */}
            {isLoading ? (
                <span className="shrink-0 text-red-800 text-md w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                    <FaCloudUploadAlt className="animate-bounce text-base" />
                </span>
            ) : (
                icon && (
                    <span className="shrink-0 text-red-900 text-md w-8 h-8 bg-red-100 headerinset rounded-full flex items-center justify-center">
                        {icon}
                    </span>
                )
            )}

            {/* 🎯 જો લોડિંગ હોય તો લોડિંગ ટેક્સ્ટ, નહીં તો નોર્મલ ટેક્સ્ટ */}
            <span className="flex-1 text-left font-black text-xs uppercase tracking-wider truncate px-1">
                {isLoading ? loadingText : text}
            </span>

            {/* લોડિંગ વખતે એરો આઇકોન છુપાઈ જશે */}
            {!isLoading && arrowicon && (
                <span className="shrink-0 text-red-200 text-base w-8 h-8 flex items-center justify-center transition-transform duration-200">
                    {arrowicon}
                </span>
            )}
        </button>
    );
}