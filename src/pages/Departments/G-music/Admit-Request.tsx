import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaHashtag, FaCamera, FaPaperPlane, FaFileAlt } from "react-icons/fa";
import { toast } from "sonner";
import Input from "../../../Components/commen/Input";
import SGDropdown from "../../../Components/commen/SGDropdown";

export default function AdmitRequestGMusic() {
    const [formData, setFormData] = useState({
        name: "",
        suid: "",
        performance: "",
        description: ""
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const performanceOptions = [
        { value: "High", label: "High" },
        { value: "Medium", label: "Medium" },
        { value: "Low", label: "Low" }
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = "Sevak name is required";
        if (!formData.suid.trim()) newErrors.suid = "SUID number is required";
        if (!formData.performance) newErrors.performance = "Please select performance level";
        if (!formData.description.trim()) newErrors.description = "Description is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fill all required fields.");
            return;
        }

        try {
            setIsSubmitting(true);
            let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            if (API_URL.endsWith('/')) {
                API_URL = API_URL.slice(0, -1);
            }

            const dataToSend = new FormData();
            dataToSend.append("name", formData.name);
            dataToSend.append("suid", formData.suid);
            dataToSend.append("performance", formData.performance);
            dataToSend.append("description", formData.description);
            
            if (selectedFile) {
                dataToSend.append("image", selectedFile);
            }

            const response = await fetch(`${API_URL}/g-music/create-request`, {
                method: 'POST',
                body: dataToSend
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(`G-Music Admit request sent successfully! 🚀`);
                setFormData({ name: "", suid: "", performance: "", description: "" });
                setSelectedFile(null);
                setPreviewUrl(null);
            } else {
                toast.error(data.message || "Failed to send request");
            }
        } catch (error) {
            console.error(error);
            toast.error("Server is offline or unreachable");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-4 md:p-8 select-none">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-red-950 uppercase tracking-tight">
                    G-Music Admit Application
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Submit student verification profile directly to G-Music Control Panel
                </p>
                <div className="h-1.5 w-16 bg-red-800 mx-auto mt-3 rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl bg-white shadow-md border border-red-50 rounded-[2.5rem] p-6 md:p-10"
            >
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="flex flex-col items-center mb-6">
                        <div className="relative w-32 h-32 rounded-full border-4 border-red-50 bg-gray-50 overflow-hidden shadow-inner flex items-center justify-center group">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <FaCamera className="text-gray-300 text-3xl" />
                            )}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
                                Upload Photo
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Upload Sevak Passport Size Photo</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Input
                                label="Sevak / Student Full Name"
                                icon={<FaUser />}
                                placeholder="Enter full name"
                                value={formData.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (errors.name) setErrors({ ...errors, name: "" });
                                }}
                                className={errors.name ? "border-red-500 ring-2 ring-red-50" : ""}
                            />
                            {errors.name && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-2">⚠️ {errors.name}</p>}
                        </div>

                        <div>
                            <Input
                                label="SUID Number"
                                type="number"
                                icon={<FaHashtag />}
                                placeholder="Enter SUID code"
                                value={formData.suid}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setFormData({ ...formData, suid: e.target.value });
                                    if (errors.suid) setErrors({ ...errors, suid: "" });
                                }}
                                className={errors.suid ? "border-red-500 ring-2 ring-red-50" : ""}
                            />
                            {errors.suid && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-2">⚠️ {errors.suid}</p>}
                        </div>
                    </div>

                    <div>
                        <SGDropdown
                            label="Select Performance Status"
                            name="performance"
                            value={formData.performance}
                            onChange={(e: { target: { name: string; value: string } }) => {
                                setFormData({ ...formData, performance: e.target.value });
                                if (errors.performance) setErrors({ ...errors, performance: "" });
                            }}
                            options={performanceOptions}
                            error={errors.performance}
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-2 pl-1">
                            <FaFileAlt className="text-red-800" size={13} />
                            Application Description / Remarks
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Provide details or reasoning for the admission request..."
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                setFormData({ ...formData, description: e.target.value });
                                if (errors.description) setErrors({ ...errors, description: "" });
                            }}
                            className={`w-full p-4 border rounded-2xl font-bold text-sm bg-gray-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-800 transition-all ${
                                errors.description ? "border-red-500 ring-2 ring-red-50" : "border-gray-200"
                            }`}
                        />
                        {errors.description && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-2">⚠️ {errors.description}</p>}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full md:w-auto px-10 h-14 rounded-2xl bg-red-800 hover:bg-red-900 text-white font-black text-base flex items-center justify-center gap-3 shadow-md cursor-pointer disabled:opacity-50"
                        >
                            <FaPaperPlane className="text-sm" />
                            {isSubmitting ? "SENDING..." : "SUBMIT APPLICATION"}
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
}