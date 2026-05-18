import React from "react";
import '../../App.css';

interface DropdownProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text?: string;
    icon?: React.ReactNode;
    arrowicon?: React.ReactNode;
    children?: React.ReactNode;
    isOpen?: boolean;
    onToggle?: () => void;
    isCollapsed?: boolean;
}

export default function Dropdown({
    className = "",
    text,
    icon,
    arrowicon,
    children,
    isOpen = false,
    onToggle,
    isCollapsed = false,
    ...props
}: DropdownProps) {
    
    const renderedChildren = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
                tabIndex: isOpen && !isCollapsed ? 0 : -1,
            });
        }
        return child;
    });

    return (
        <div className="w-full flex flex-col gap-1 p-1">
            <button
                type="button"
                onClick={onToggle} 
                aria-expanded={isOpen}
                className={`
                    relative flex items-center justify-between gap-3 bg-gray-50
                    text-red-800 rounded-2xl p-2.5 transition-all duration-200
                    active:scale-[0.98] w-full cursor-pointer
                    headerinset
                    focus:outline-none focus:ring-2 ring-red-950/40
                    ${className}
                `}
                {...props}
            >
                {icon && (
                    <span className="text-red-900 text-md w-8 h-8 bg-red-100 shadow-sm rounded-full flex items-center justify-center shrink-0">
                        {icon}
                    </span>
                )}

                {text && !isCollapsed && (
                    <span className="flex-1 text-left font-black text-xs uppercase tracking-wider truncate px-1">
                        {text}
                    </span>
                )}

                {arrowicon && !isCollapsed && (
                    <span 
                        className={`shrink-0 text-red-800 text-base w-8 h-8 flex items-center justify-center transition-transform duration-300 ${
                            isOpen ? "rotate-90" : "rotate-0"
                        }`}
                    >
                        {arrowicon}
                    </span>
                )}
            </button>

            <div 
                className={`
                    grid transition-all duration-300 ease-in-out overflow-hidden
                    ${(!isCollapsed && isOpen) ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"}
                `}
            >
                <div 
                    className={`
                        min-h-0 bg-red-100 rounded-2xl flex flex-col gap-0.5 headerinset p-1.5 transition-all duration-300
                        ${(!isCollapsed && isOpen) 
                            ? "border border-red-800/20 shadow-inner" 
                            : "border-0 border-transparent px-0 py-0"
                        }
                    `}
                >
                    {renderedChildren ? renderedChildren : (
                        <div className="text-[10px] text-red-900/50 font-black uppercase tracking-wider p-3 text-center italic">
                            No options available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}