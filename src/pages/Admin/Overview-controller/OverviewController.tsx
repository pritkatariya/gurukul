import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaImage, FaRotateLeft, FaTrash } from "react-icons/fa6";
import { IoIosImages } from "react-icons/io";

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
            <div className="flex min-h-full items-center justify-center rounded-3xl bg-linear-to-br from-red-50 via-white to-red-100 p-8 shadow-inner">
                <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-red-800">
                        Loading overview controller...
                    </p>
                    <p className="mt-2 text-xs font-medium text-red-700/70">
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-800">
                        Loading overview controller...
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-700/70">
                        Fetching hero, campus, and Daily Darshan assets.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-full rounded-4xl border border-red-100 bg-white p-5 shadow-sm md:p-7">
            <div className="mb-6 grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
                <div>
                    <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.3em] text-red-800">
                        Overview Manager
                    </span>
                    <div className="mt-4 max-w-2xl">
                        <h1 className="text-3xl font-black text-red-900 sm:text-4xl">
                            Homepage Image Control
                        </h1>
                        <p className="mt-3 text-sm font-medium text-red-700/80 sm:text-base">
                            Configure the landing page visual sections, upload hero banners, campus imagery, and Daily Darshan highlights with confidence.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-3xl border border-red-100 bg-red-50/80 p-4 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">
                            Hero Images
                        </p>
                        <p className="mt-2 text-2xl font-black text-red-900">{config.heroImages.length}</p>
                    </div>
                    <div className="rounded-3xl border border-red-100 bg-red-50/80 p-4 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">
                            Darshan Items
                        </p>
                        <p className="mt-2 text-2xl font-black text-red-900">{config.dailyDarshanImages.length}/10</p>
                    </div>
                    <div className="rounded-3xl border border-red-100 bg-red-50/80 p-4 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">
                            Campus Gallery
                        </p>
                        <p className="mt-2 text-2xl font-black text-red-900">{config.campusGalleryImages.length}</p>
                    </div>
                </div>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-3xl border border-red-100 bg-red-50/70 p-4">
                    <p className="text-sm font-black text-red-900">Last synced</p>
                    <p className="mt-1 text-xs font-medium text-red-700/80">
                        Local preview is active. Save to persist changes to the server.
                    </p>
                </div>

        <div className="w-full min-h-full rounded-4xl bg-white p-5 shadow-sm md:p-7">
            <div className="mb-6 gap-4 w-full xl:items-start justify-between flex flex-col">
                <div className=" w-full">
                    <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.3em] text-gray-950">
                        Overview Manager
                    </span>
                    <div className="mt-4 max-w-2xl">
                        <h1 className="text-3xl font-black text-gray-700 sm:text-4xl">
                            Homepage Image Control
                        </h1>
                        <p className="mt-3 text-sm font-medium text-red-600/80 sm:text-base">
                            Configure the landing page visual sections, upload hero banners, campus imagery, and Daily Darshan highlights with confidence.
                        </p>
                    </div>
                </div>

                <div className="grid sm:flex sm:justify-center sm:items-center gap-3 my-5 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-3xl border border-red-100  p-4 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-[0.2em]">
                            Hero Images
                        </p>
                        <p className="mt-2 text-2xl font-black">{config.heroImages.length}</p>
                    </div>
                    <div className="rounded-3xl border border-red-100  p-4 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-[0.2em]">
                            Darshan Items
                        </p>
                        <p className="mt-2 text-2xl font-black">{config.dailyDarshanImages.length}/10</p>
                    </div>
                    <div className="rounded-3xl border border-red-100 p-4 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-[0.2em]">
                            Campus Gallery
                        </p>
                        <p className="mt-2 text-2xl font-black">{config.campusGalleryImages.length}</p>
                    </div>
                </div>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <IoIosImages size={24} className="text-gray-900 mx-5" />
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-3xl border border-red-200 bg-white px-5 text-sm font-black text-red-800 shadow-sm transition-all hover:bg-red-50 active:scale-95"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-3xl border border-red-200 bg-white px-5 text-sm font-black text-gray-800 shadow-sm transition-all hover:bg-red-50 active:scale-95"
                    >
                        <FaRotateLeft /> Reset
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-3xl bg-red-900 px-5 text-sm font-black text-white shadow-lg transition-all hover:bg-red-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-[28px] border border-red-100 bg-red-50/60 p-5 shadow-sm">
                    <div className="mb-5 flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-red-800">
                            1
                        </div>
                        <h2 className="text-xl font-black text-red-900">Hero Slider</h2>
                        <p className="text-sm font-medium text-red-700/80">
                <section className="rounded-[28px] p-5 shadow-sm">
                    <div className="mb-5 flex flex-col gap-2">
                        <h2 className="text-xl font-black">Hero Slider</h2>
                        <p className="text-sm font-medium">
                            Upload the primary homepage banners users will see on the landing page.
                        </p>
                    </div>

                    <div className="grid gap-5">
                        <MultiImageUploadView
                            label="Hero Banner Images"
                            images={config.heroImages}
                            onUpload={(e) => handleMultiImageUpload(e, "heroImages", setHeroFiles)}
                            onRemove={(idx) => removeImageFromSection(idx, "heroImages", setHeroFiles)}
                        />

                        <ImageInput
                            label="Navbar / Main Logo"
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

                <section className="rounded-[28px] border border-red-100 bg-red-50/60 p-5 shadow-sm">
                    <div className="mb-5 flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-red-800">
                            2
                        </div>
                        <h2 className="text-xl font-black text-red-900">Campus Section</h2>
                        <p className="text-sm font-medium text-red-700/80">
                <section className="rounded-[28px]  p-5 shadow-sm">
                    <div className="mb-5 flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.25em]">
                            2
                        </div>
                        <h2 className="text-xl font-black text-gray-900">Campus Section</h2>
                        <p className="text-sm font-medium text-gray-700/80">
                            Set the campus hero image and supporting gallery visuals.
                        </p>
                    </div>

                    <div className="grid gap-5">
                        <ImageInput
                            label="Campus Hero Image"
                            value={config.campusImage}
                            onUpload={(e) => handleSingleImageUpload(e, "campus")}
                            onClear={() => {
                                if (isBlobUrl(config.campusImage)) URL.revokeObjectURL(config.campusImage);
                                setCampusFile(null);
                                updateField("campusImage", "");
                            }}
                        />

                        <MultiImageUploadView
                            label="Campus Gallery Images"
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

                <section className="rounded-[28px] border border-red-100 bg-red-50/60 p-5 shadow-sm xl:col-span-2">
                    <div className="mb-5 flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-red-800">
                            3
                        </div>
                        <h2 className="text-xl font-black text-red-900">Daily Darshan</h2>
                        <p className="text-sm font-medium text-red-700/80">
                <section className="rounded-[28px] p-5 shadow-sm xl:col-span-2">
                    <div className="mb-5 flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.25em]">
                            3
                        </div>
                        <h2 className="text-xl font-black text-gray-900">Daily Darshan</h2>
                        <p className="text-sm font-medium text-gray-700/80">
                            Upload up to 10 Daily Darshan cards for the homepage carousel.
                        </p>
                    </div>

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
        <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-red-800">
                    {label}
                </span>
                <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-700">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-gray-800">
                    {label}
                </span>
                <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700">
                    Single image
                </span>
            </div>

            <div className="flex flex-col gap-4">
                <label className="inline-flex h-12 min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-900 px-4 text-sm font-black text-white shadow-sm transition-all hover:bg-red-800 active:scale-95">
                    <FaImage /> Upload Image
                    <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
                </label>

                {value ? (
                    <div className="group relative overflow-hidden rounded-3xl border border-red-100 bg-red-50">
                        <img src={value} alt={label} className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                        <button
                            type="button"
                            onClick={onClear}
                            className="absolute bottom-4 right-4 rounded-full border border-red-200 bg-white/95 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-red-800 shadow-sm transition hover:bg-white"
                            className="absolute bottom-4 right-4 rounded-full border border-red-200 bg-white/95 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-gray-800 shadow-sm transition hover:bg-white"
                        >
                            Clear
                        </button>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/80 px-4 py-10 text-center text-sm font-medium text-red-700/80">
                    <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/80 px-4 py-10 text-center text-sm font-medium text-gray-700/80">
                        No image selected yet. Use the upload button to add one.
                    </div>
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
        <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="block text-xs font-black uppercase tracking-[0.25em] text-red-800">
                        {label}
                    </span>
                    <p className="mt-1 text-xs text-red-700/70">
                    <span className="block text-xs font-black uppercase tracking-[0.25em] text-gray-800">
                        {label}
                    </span>
                    <p className="mt-1 text-xs text-gray-700/70">
                        Upload multiple images for this section and manage previews instantly.
                    </p>
                </div>

                <label className="inline-flex h-12 min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-900 px-4 text-sm font-black text-white shadow-sm transition-all hover:bg-red-800 active:scale-95">
                    <FaImage /> Add Images
                    <input type="file" accept="image/*" multiple onChange={onUpload} className="hidden" />
                </label>
            </div>

            {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                    {images.map((src, index) => (
                        <div
                            key={`${src}-${index}`}
                            className="group relative overflow-hidden rounded-3xl border border-red-100 bg-red-50 transition duration-200 hover:shadow-lg"
                        >
                            <img src={src} alt={`Preview ${index + 1}`} className="h-28 w-full object-cover" />
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-800 shadow-md transition hover:bg-red-50"
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-800 shadow-md transition hover:bg-red-50"
                            >
                                <FaTrash className="text-[11px]" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/80 px-5 py-10 text-center text-sm font-medium text-red-700/80">
                <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/80 px-5 py-10 text-center text-sm font-medium text-gray-700/80">
                    No images added yet. Click the upload button to start adding visuals.
                </div>
            )}
        </div>
    );
}