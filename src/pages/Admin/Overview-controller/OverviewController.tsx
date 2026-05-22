import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaImage, FaRotateLeft, FaTrash } from "react-icons/fa6";

type OverviewConfig = {
    heroImages: string[];
    logoImage: string;
    campusImage: string;
    campusGalleryImages: string[];
    dailyDarshanImages: string[];
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const defaultConfig: OverviewConfig = {
    heroImages: [],
    logoImage: "",
    campusImage: "",
    campusGalleryImages: [],
    dailyDarshanImages: [],
};

const isBlobUrl = (value: string) => value.startsWith("blob:");

export default function OverviewController() {
    const [config, setConfig] = useState<OverviewConfig>(defaultConfig);

    const [heroFiles, setHeroFiles] = useState<File[]>([]);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [campusFile, setCampusFile] = useState<File | null>(null);
    const [campusGalleryFiles, setCampusGalleryFiles] = useState<File[]>([]);
    const [dailyDarshanFiles, setDailyDarshanFiles] = useState<File[]>([]);

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await fetch(`${API_URL}/overview/config`);
                const text = await response.text();

                let data: any = null;

                try {
                    data = text ? JSON.parse(text) : null;
                } catch {
                    throw new Error(text || "Overview config response was not valid JSON");
                }

                if (!response.ok || !data?.success) {
                    throw new Error(data?.message || "Overview config load failed");
                }

                setConfig({ ...defaultConfig, ...data.config });
            } catch (error) {
                console.error(error);
                toast.error(error instanceof Error ? error.message : "Overview config load failed");
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, []);

    useEffect(() => {
        return () => {
            [
                ...config.heroImages,
                ...config.campusGalleryImages,
                ...config.dailyDarshanImages,
            ].forEach((src) => {
                if (isBlobUrl(src)) URL.revokeObjectURL(src);
            });

            if (isBlobUrl(config.logoImage)) URL.revokeObjectURL(config.logoImage);
            if (isBlobUrl(config.campusImage)) URL.revokeObjectURL(config.campusImage);
        };
    }, []);

    const updateField = <K extends keyof OverviewConfig>(key: K, value: OverviewConfig[K]) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const handleMultiImageUpload = (
        event: React.ChangeEvent<HTMLInputElement>,
        imageKey: "heroImages" | "campusGalleryImages" | "dailyDarshanImages",
        setFilesArray: React.Dispatch<React.SetStateAction<File[]>>,
        maxCount?: number
    ) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const currentImages = config[imageKey];
        const remainingSlots = maxCount ? Math.max(maxCount - currentImages.length, 0) : files.length;

        if (maxCount && remainingSlots <= 0) {
            toast.error(`Maximum ${maxCount} images allowed`);
            event.target.value = "";
            return;
        }

        const acceptedFiles = maxCount ? files.slice(0, remainingSlots) : files;

        if (maxCount && files.length > acceptedFiles.length) {
            toast.error(`Only ${remainingSlots} more image(s) allowed`);
        }

        setFilesArray((prev) => [...prev, ...acceptedFiles]);

        const previews = acceptedFiles.map((file) => URL.createObjectURL(file));

        setConfig((prev) => ({
            ...prev,
            [imageKey]: [...prev[imageKey], ...previews],
        }));

        event.target.value = "";
        toast.success("Images selected");
    };

    const handleSingleImageUpload = (
        event: React.ChangeEvent<HTMLInputElement>,
        type: "logo" | "campus"
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const preview = URL.createObjectURL(file);

        if (type === "logo") {
            if (isBlobUrl(config.logoImage)) URL.revokeObjectURL(config.logoImage);
            setLogoFile(file);
            updateField("logoImage", preview);
        } else {
            if (isBlobUrl(config.campusImage)) URL.revokeObjectURL(config.campusImage);
            setCampusFile(file);
            updateField("campusImage", preview);
        }

        event.target.value = "";
        toast.success("Image selected");
    };

    const removeImageFromSection = (
        index: number,
        imageKey: "heroImages" | "campusGalleryImages" | "dailyDarshanImages",
        setFilesArray: React.Dispatch<React.SetStateAction<File[]>>
    ) => {
        const removed = config[imageKey][index];

        if (removed && isBlobUrl(removed)) {
            URL.revokeObjectURL(removed);
        }

        setConfig((prev) => ({
            ...prev,
            [imageKey]: prev[imageKey].filter((_, i) => i !== index),
        }));

        if (isBlobUrl(removed)) {
            const blobIndex =
                config[imageKey].slice(0, index + 1).filter((src) => isBlobUrl(src)).length - 1;

            setFilesArray((prev) => prev.filter((_, i) => i !== blobIndex));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const formData = new FormData();

            const filterExisting = (urls: string[]) => urls.filter((src) => !isBlobUrl(src));

            formData.append("existingHeroImages", JSON.stringify(filterExisting(config.heroImages)));
            formData.append(
                "existingCampusGalleryImages",
                JSON.stringify(filterExisting(config.campusGalleryImages))
            );
            formData.append(
                "existingDailyDarshanImages",
                JSON.stringify(filterExisting(config.dailyDarshanImages).slice(0, 10))
            );

            if (config.campusImage && !isBlobUrl(config.campusImage)) {
                formData.append("campusImage", config.campusImage);
            }

            if (config.logoImage && !isBlobUrl(config.logoImage)) {
                formData.append("logoImage", config.logoImage);
            }

            heroFiles.forEach((file) => formData.append("heroImages", file));
            campusGalleryFiles.forEach((file) => formData.append("campusGalleryImages", file));
            dailyDarshanFiles.forEach((file) => formData.append("dailyDarshanImages", file));

            if (logoFile) formData.append("logoImage", logoFile);
            if (campusFile) formData.append("campusImage", campusFile);

            const response = await fetch(`${API_URL}/overview/config`, {
                method: "PUT",
                body: formData,
            });

            const text = await response.text();

            let data: any = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                throw new Error(text || "Server response was not valid JSON");
            }

            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Save failed");
            }

            setConfig({ ...defaultConfig, ...data.config });

            setHeroFiles([]);
            setCampusGalleryFiles([]);
            setDailyDarshanFiles([]);
            setLogoFile(null);
            setCampusFile(null);

            window.dispatchEvent(new Event("overview-config-updated"));
            toast.success("Overview settings saved successfully!");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Overview settings save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        [
            ...config.heroImages,
            ...config.campusGalleryImages,
            ...config.dailyDarshanImages,
        ].forEach((src) => {
            if (isBlobUrl(src)) URL.revokeObjectURL(src);
        });

        if (isBlobUrl(config.logoImage)) URL.revokeObjectURL(config.logoImage);
        if (isBlobUrl(config.campusImage)) URL.revokeObjectURL(config.campusImage);

        setConfig(defaultConfig);
        setHeroFiles([]);
        setCampusGalleryFiles([]);
        setDailyDarshanFiles([]);
        setLogoFile(null);
        setCampusFile(null);

        toast.info("Reset locally. Click Save to update database.");
    };

    if (loading) {
        return (
            <div className="flex min-h-full items-center justify-center rounded-2xl bg-white p-6">
                <p className="text-sm font-black uppercase tracking-wider text-red-800">
                    Loading overview controller...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-full rounded-2xl bg-white p-4 md:p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-red-700">
                        Super Admin
                    </p>
                    <h1 className="mt-2 text-3xl font-black text-red-800">Overview Controller</h1>
                    <p className="mt-2 text-sm font-semibold text-red-700/70">
                        Landing page ni main images control karo.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex h-11 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-black text-red-800 shadow-sm transition-all hover:bg-red-50 active:scale-95"
                    >
                        <FaRotateLeft /> Reset
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex h-11 items-center gap-2 rounded-xl bg-red-800 px-5 text-sm font-black text-white shadow-md transition-all hover:bg-red-700 active:scale-95 disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-red-100 bg-red-50/40 p-5">
                    <h2 className="mb-4 border-b border-red-100 pb-2 text-lg font-black text-red-800">
                        1. Hero Slider Section
                    </h2>

                    <div className="grid gap-4">
                        <MultiImageUploadView
                            label="Hero Background Banner Images"
                            images={config.heroImages}
                            onUpload={(e) => handleMultiImageUpload(e, "heroImages", setHeroFiles)}
                            onRemove={(idx) => removeImageFromSection(idx, "heroImages", setHeroFiles)}
                        />

                        <ImageInput
                            label="Gurukul Navbar / Main Logo"
                            value={config.logoImage}
                            onUpload={(e) => handleSingleImageUpload(e, "logo")}
                            onClear={() => {
                                if (isBlobUrl(config.logoImage)) URL.revokeObjectURL(config.logoImage);
                                setLogoFile(null);
                                updateField("logoImage", "");
                            }}
                        />
                    </div>
                </section>

                <section className="rounded-2xl border border-red-100 bg-red-50/40 p-5">
                    <h2 className="mb-4 border-b border-red-100 pb-2 text-lg font-black text-red-800">
                        2. Campus Info Section
                    </h2>

                    <div className="grid gap-4">
                        <ImageInput
                            label="Main Campus Large Image"
                            value={config.campusImage}
                            onUpload={(e) => handleSingleImageUpload(e, "campus")}
                            onClear={() => {
                                if (isBlobUrl(config.campusImage)) URL.revokeObjectURL(config.campusImage);
                                setCampusFile(null);
                                updateField("campusImage", "");
                            }}
                        />

                        <MultiImageUploadView
                            label="Campus Side Grid Images"
                            images={config.campusGalleryImages}
                            onUpload={(e) =>
                                handleMultiImageUpload(e, "campusGalleryImages", setCampusGalleryFiles)
                            }
                            onRemove={(idx) =>
                                removeImageFromSection(idx, "campusGalleryImages", setCampusGalleryFiles)
                            }
                        />
                    </div>
                </section>

                <section className="rounded-2xl border border-red-100 bg-red-50/40 p-5 xl:col-span-2">
                    <h2 className="mb-4 border-b border-red-100 pb-2 text-lg font-black text-red-800">
                        3. Daily Darshan Section
                    </h2>

                    <MultiImageUploadView
                        label={`Daily Darshan Images (${config.dailyDarshanImages.length}/10)`}
                        images={config.dailyDarshanImages}
                        onUpload={(e) =>
                            handleMultiImageUpload(
                                e,
                                "dailyDarshanImages",
                                setDailyDarshanFiles,
                                10
                            )
                        }
                        onRemove={(idx) =>
                            removeImageFromSection(idx, "dailyDarshanImages", setDailyDarshanFiles)
                        }
                    />
                </section>
            </div>
        </div>
    );
}

function ImageInput({
    label,
    value,
    onUpload,
    onClear,
}: {
    label: string;
    value: string;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
}) {
    return (
        <div>
            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-red-800">
                {label}
            </span>

            <div className="flex flex-col gap-3 rounded-xl border border-red-100 bg-white p-3">
                <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-black text-white transition-all hover:bg-red-700 active:scale-95">
                    <FaImage /> Upload Image
                    <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
                </label>

                {value && (
                    <>
                        <img src={value} alt={label} className="h-40 w-full rounded-xl object-cover" />
                        <button
                            type="button"
                            onClick={onClear}
                            className="h-10 rounded-xl border border-red-200 text-sm font-black text-red-800 transition-all hover:bg-red-50"
                        >
                            Clear Image
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function MultiImageUploadView({
    label,
    images,
    onUpload,
    onRemove,
}: {
    label: string;
    images: string[];
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
}) {
    return (
        <div>
            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-red-800">
                {label}
            </span>

            <div className="rounded-xl border border-red-100 bg-white p-3">
                <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-black text-white transition-all hover:bg-red-700 active:scale-95">
                    <FaImage /> Upload Images
                    <input type="file" accept="image/*" multiple onChange={onUpload} className="hidden" />
                </label>

                {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                        {images.map((src, index) => (
                            <div
                                key={`${src}-${index}`}
                                className="relative overflow-hidden rounded-xl border border-red-100"
                            >
                                <img src={src} alt="Section Media" className="h-24 w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-800 shadow-md hover:bg-red-50"
                                >
                                    <FaTrash className="text-[10px]" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}