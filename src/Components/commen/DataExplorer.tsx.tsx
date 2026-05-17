import { useState } from "react";
import { FaList, FaTable, FaUser } from "react-icons/fa";

interface DataExplorerProps {
    headers: string[];
    data: Array<Record<string, any>>;
}

export default function DataExplorer({ headers, data }: DataExplorerProps) {
    const [viewMode, setViewMode] = useState<"table" | "card">("table");

    return (
        <div className="w-full h-auto p-5">

            {/* View Switcher Controls */}
            <div className="flex justify-end mb-6">
                <div className="inline-flex rounded-lg bg-gray-100 p-1 ring-1 ring-gray-200">
                    <button
                        onClick={() => setViewMode("table")}
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                            viewMode === "table" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        <FaList />
                    </button>
                    <button
                        onClick={() => setViewMode("card")}
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                            viewMode === "card" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        <FaTable />
                    </button>
                </div>
            </div>

            {/* Conditional Rendering based on viewMode */}
            {viewMode === "table" ? (
                /* --- TABLE VIEW --- */
                <div className="overflow-hidden rounded-xl border border-red-100 shadow-xl shadow-gray-200 w-full">
                    <table className="w-full table-auto border-collapse bg-white text-left text-sm text-gray-600">
                        <thead className="bg-red-600 text-xs font-semibold uppercase tracking-wider text-white">
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index} scope="col" className="px-6 py-4">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                            {data.map((item, rowIndex) => (
                                <tr key={rowIndex} className="transition-colors duration-200 hover:bg-red-50/50">
                                    
                                    {/* 💡 ૧. પ્રોફાઈલ ઈમેજ કોલમ */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.img ? (
                                            <img 
                                                src={item.img} 
                                                alt={item.name} 
                                                className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                                                onError={(e) => {
                                                    // જો ઈમેજ લોડ થવામાં એરર આવે તો આ બેકઅપ અવતાર બતાવશે
                                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-800 font-bold flex items-center justify-center border border-red-200 shadow-sm">
                                                {item.name ? item.name.charAt(0).toUpperCase() : <FaUser className="text-xs"/>}
                                            </div>
                                        )}
                                    </td>

                                    {/* 💡 ૨. ફુલ નેમ કોલમ */}
                                    <td className="px-6 py-4 font-bold text-gray-950 whitespace-nowrap">
                                        {item.name}
                                    </td>

                                    {/* 💡 ૩. રોલ કોલમ */}
                                    <td className="px-6 py-4 font-medium text-gray-700 whitespace-nowrap">
                                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800 border border-gray-200 uppercase">
                                            {item.role}
                                        </span>
                                    </td>

                                    {/* 💡 ૪. ડિપાર્ટમેન્ટ કોલમ */}
                                    <td className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap">
                                        <span className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                            {item.dept}
                                        </span>
                                    </td>

                                    {/* 💡 ૫. જોઈન્ડ ડેટ કોલમ */}
                                    <td className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap">
                                        {item.date}
                                    </td>

                                    {/* 💡 ૬. સ્ટેટસ કોલમ */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                            {item.status}
                                        </span>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* --- CARD VIEW --- */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="group relative rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-red-100 hover:shadow-xl hover:shadow-gray-200/50"
                        >
                            {/* Top Red Bar Accent */}
                            <div className="absolute top-0 left-0 h-1 w-full bg-red-600 rounded-t-xl opacity-80 group-hover:opacity-100" />

                            <div className="flex items-center gap-4 mb-4">
                                {item.img ? (
                                    <img 
                                        src={item.img} 
                                        alt={item.name} 
                                        className="w-14 h-14 rounded-full object-cover border-2 border-red-50 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-red-50 text-red-800 font-black text-lg flex items-center justify-center border border-red-100 shrink-0">
                                        {item.name ? item.name.charAt(0).toUpperCase() : "G"}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base text-red-950 tracking-tight truncate">{item.name}</h3>
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20 mt-0.5">
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-3 text-sm border-t border-gray-100">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Assigned Role:</span>
                                    <span className="font-bold text-gray-800 uppercase text-xs">{item.role}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Department:</span>
                                    <span className="font-medium text-red-700 text-xs bg-red-50/50 px-2 py-1 rounded border border-red-100/50">{item.dept}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Joined Date:</span>
                                    <span className="font-medium text-gray-600">{item.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}