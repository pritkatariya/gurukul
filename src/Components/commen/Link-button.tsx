import { Link } from "react-router-dom";
import '../../App.css';

// LinkProps માંથી to નો ટાઇપ પ્રોપરલી મળે તે માટે React Router ના ટાઇપનો ઉપયોગ કર્યો
interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    To: string;
    className?: string;
    text?: string;
    icon?: React.ReactNode;
    arrowicon?: React.ReactNode;
    isCollapsed?: boolean;
}

export default function LinkButton({
    To,
    className = "",
    text,
    icon,
    arrowicon,
    isCollapsed = false,
    ...props
}: LinkButtonProps) {
    return (
        <div className="w-full p-1">
            <Link
                to={To}
                className={`
                    relative flex items-center justify-between gap-3 bg-gray-50
                    text-red-800 font-medium rounded-2xl p-2.5 transition-all duration-200
                    active:scale-[0.98] w-full cursor-pointer
                    headerinset
                    focus:outline-none focus:ring-2 ring-red-950/40
                    ${className}
                `}
                {...props}
            >
                {icon && (
                    <span className="text-red-900 text-md w-8 h-8 bg-red-100 shadow-md shadow-gray-950 rounded-full flex items-center justify-center shrink-0">
                        {icon}
                    </span>
                )}

                {text && !isCollapsed && (
                    <span className="flex-1 text-left font-semibold text-sm tracking-wide truncate px-1">
                        {text}
                    </span>
                )}

                {arrowicon && !isCollapsed && (
                    <span className="shrink-0 text-red-800 text-xl w-8 h-8 flex items-center justify-center">
                        {arrowicon}
                    </span>
                )}
            </Link>
        </div>
    );
}