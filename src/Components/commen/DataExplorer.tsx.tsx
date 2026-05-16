import { useState } from "react";
import { FaList, FaTable } from "react-icons/fa";

interface DataExplorerProps {
    headers: string[];
    data: Array<Record<string, any>>;
}

export default function DataExplorer({ headers, data }: DataExplorerProps) {
    // view 'table' અથવા 'card' હોઈ શકે છે
    const [viewMode, setViewMode] = useState<"table" | "card">("table");

    return (
        <div className="w-full h-auto p-5">

            {/* View Switcher Controls */}
            <div className="flex justify-end mb-6">
                <div className="inline-flex rounded-lg bg-gray-100 p-1 ring-1 ring-gray-200">
                    <button
                        onClick={() => setViewMode("table")}
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 ${viewMode === "table"
                            ? "bg-white text-red-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        <FaList />
                    </button>
                    <button
                        onClick={() => setViewMode("card")}
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 ${viewMode === "card"
                            ? "bg-white text-red-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        <FaTable />
                    </button>
                </div>
            </div>

            {/* Conditional Rendering based on viewMode */}
            {viewMode === "table" ? (
                /* --- TABLE VIEW --- */
                <div className="overflow-hidden rounded-xl border border-red-100 shadow-xl shadow-gray-200">
                    <table className="w-full table-auto border-collapse bg-white text-left text-sm text-gray-600">
                        <thead className="bg-red-600 text-xs font-semibold uppercase tracking-wider text-white">
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index} scope="col" className="px-6 py-4">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="transition-colors duration-200 hover:bg-red-50/50">
                                    {Object.values(row).map((value, cellIndex) => (
                                        <td key={cellIndex} className="px-6 py-4 font-medium text-gray-950">
                                            {cellIndex === 4 ? ( // જો છેલ્લી કોલમ 'Status' હોય
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    {value}
                                                </span>
                                            ) : cellIndex === 2 ? ( // જો 'Total Sevaks' હોય
                                                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                                    {value}
                                                </span>
                                            ) : (
                                                value
                                            )}
                                        </td>
                                    ))}
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

                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-red-950 tracking-tight">{item.name}</h3>
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    {item.status}
                                </span>
                            </div>

                            <div className="space-y-3 pt-2 text-sm border-t border-gray-50">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Head of Dept:</span>
                                    <span className="font-medium text-gray-800">{item.head}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Location:</span>
                                    <span className="font-medium text-gray-600 text-xs bg-gray-50 px-2 py-1 rounded">{item.location}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-400">Strength:</span>
                                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                        {item.sevaks}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}