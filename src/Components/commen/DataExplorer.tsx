import { useState } from "react";
import { FaList, FaTable, FaUser } from "react-icons/fa";
import ActionDropdown from "./ActionDropdown";

interface DataExplorerProps {
    headers: string[];
    data: Array<Record<string, any>>;
    onView: (id: string | number, item: any) => void;
    onEdit: (id: string | number, item: any) => void;
    onDelete: (id: string | number) => void;
}

export default function DataExplorer({ headers, data, onView, onEdit, onDelete }: DataExplorerProps) {
    const [viewMode, setViewMode] = useState<"table" | "card">("table");

    return (
        <div className="w-full h-auto p-4 overflow-visible">

            <div className="flex justify-end mb-6">
                <div className="inline-flex rounded-xl bg-gray-100 p-1 ring-1 ring-gray-200/60">
                    <button
                        onClick={() => setViewMode("table")}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
                            viewMode === "table" ? "bg-white text-red-800 shadow-sm" : "text-gray-400 hover:text-gray-700"
                        }`}
                    >
                        <FaList size={14} />
                    </button>
                    <button
                        onClick={() => setViewMode("card")}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 cursor-pointer ${
                            viewMode === "card" ? "bg-white text-red-800 shadow-sm" : "text-gray-400 hover:text-gray-700"
                        }`}
                    >
                        <FaTable size={14} />
                    </button>
                </div>
            </div>

            {viewMode === "table" ? (
                <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] w-full bg-white">
                    <table className="w-full min-w-[720px] table-auto border-collapse text-left text-sm text-gray-600">
                        <thead className="bg-red-800 text-[11px] font-black uppercase tracking-wider text-amber-50 border-b border-red-900">
                            <tr>
                                {headers.map((header, index) => (
                                    <th 
                                        key={index} 
                                        scope="col" 
                                        className={`px-6 py-4.5 ${index === 0 ? "rounded-tl-2xl pl-8" : ""} ${index >= 3 && index <= 4 ? "hidden sm:table-cell" : ""}`}
                                    >
                                        {header}
                                    </th>
                                ))}
                                <th scope="col" className="px-6 py-4.5 text-center w-24 rounded-tr-2xl pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 border-t border-gray-50 bg-white">
                            {data.map((item, rowIndex) => (
                                <tr key={rowIndex} className="transition-colors duration-150 hover:bg-red-50/20 group">
                                    
                                    <td className="px-6 py-4.5 whitespace-nowrap pl-8">
                                        {item.img ? (
                                            <img 
                                                src={item.img} 
                                                alt={item.name} 
                                                className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm group-hover:scale-105 transition-transform"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-800 font-black text-xs flex items-center justify-center border border-red-100 shadow-inner group-hover:scale-105 transition-transform">
                                                {item.name ? item.name.charAt(0).toUpperCase() : <FaUser className="text-xs"/>}
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-4.5 font-black text-gray-800 text-[13px] break-words max-w-[220px]">
                                        {item.name}
                                    </td>

                                    <td className="px-6 py-4.5 font-medium text-gray-700">
                                        <span className="inline-flex items-center rounded-xl bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700 border border-gray-200/80 shadow-sm uppercase">
                                            {item.role}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4.5 font-medium text-gray-600 hidden sm:table-cell whitespace-nowrap">
                                        <span className="inline-flex items-center rounded-xl bg-red-50/60 px-3 py-1 text-xs font-bold text-red-800 border border-red-100/50">
                                            {item.dept}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4.5 font-bold text-gray-500 text-xs hidden sm:table-cell whitespace-nowrap">
                                        {item.date}
                                    </td>

                                    <td className="px-6 py-4.5 whitespace-nowrap">
                                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 border border-emerald-100 shadow-sm">
                                            {item.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4.5 text-center whitespace-nowrap pr-8 relative overflow-visible">
                                        <div className="relative z-50 inline-block">
                                            <ActionDropdown 
                                                onView={() => onView(item.id, item)}
                                                onEdit={() => onEdit(item.id, item)}
                                                onDelete={() => onDelete(item.id)}
                                            />
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible">
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-red-100 hover:shadow-xl hover:shadow-gray-200/40 overflow-visible"
                        >
                            <div className="absolute top-0 left-0 h-1 w-full bg-red-800 rounded-t-2xl opacity-90 group-hover:opacity-100" />

                            <div className="absolute top-5 right-5 z-50">
                                <ActionDropdown 
                                    onView={() => onView(item.id, item)}
                                    onEdit={() => onEdit(item.id, item)}
                                    onDelete={() => onDelete(item.id)}
                                />
                            </div>

                            <div className="flex items-center gap-4 mb-5">
                                {item.img ? (
                                    <img 
                                        src={item.img} 
                                        alt={item.name} 
                                        className="w-14 h-14 rounded-full object-cover border-2 border-red-100 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-red-50 text-red-800 font-black text-lg flex items-center justify-center border border-red-100 shrink-0 shadow-inner">
                                        {item.name ? item.name.charAt(0).toUpperCase() : "G"}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0 pr-8">
                                    <h3 className="font-black text-base text-red-950 tracking-tight truncate">{item.name}</h3>
                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 border border-emerald-100 mt-1">
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 text-xs border-t border-gray-50 font-bold">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Assigned Role:</span>
                                    <span className="text-gray-700 uppercase text-[11px] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">{item.role}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Department/Code:</span>
                                    <span className="text-red-800 text-[11px] bg-red-50/60 px-2 py-0.5 rounded-lg border border-red-100/50">{item.dept}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Date:</span>
                                    <span className="text-gray-500 font-mono">{item.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}