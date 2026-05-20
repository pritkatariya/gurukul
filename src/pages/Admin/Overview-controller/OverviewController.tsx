import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaImage, FaRotateLeft, FaEye, FaEyeSlash, FaTrash } from "react-icons/fa6";

type OverviewConfig = {
    heroImages: string[];
    logoImage: string;

    campusImage: string;
    campusGalleryImages: string[];

    stackTitle: string;
    stackSubtitle: string;
    stackImages: string[];
    showStackSection: boolean;

    chromaTitle: string;
    chromaSubtitle: string;
    chromaImages: string[];
    showChromaSection: boolean;
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const defaultConfig: OverviewConfig = {
    heroImages: [],
    logoImage: "",

    campusImage: "",
    campusGalleryImages: [],

    stackTitle: "Memories in Motion",
    stackSubtitle: "Drag karo, click karo, athva wait karo.",
    stackImages: [],
    showStackSection: true,

    chromaTitle: "Gurukul Highlights",
    chromaSubtitle: "Move cursor over cards to reveal color spotlight.",
    chromaImages: [],
    showChromaSection: true,
};

const isBlobUrl = (value: string) => value.startsWith("blob:");

export default function OverviewController() {
    const [config, setConfig] = useState<OverviewConfig>(defaultConfig);

    const [heroFiles, setHeroFiles] = useState<File[]>([]);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [campusFile, setCampusFile] = useState<File | null>(null);
    const [campusGalleryFiles, setCampusGalleryFiles] = useState<File[]>([]);
    const [stackFiles, setStackFiles] = useState<File[]>([]);
    const [chromaFiles, setChromaFiles] = useState<File[]>([]);

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
            [...config.heroImages, ...config.campusGalleryImages, ...config.stackImages, ...config.chromaImages].forEach(
                (src) => {
                    if (isBlobUrl(src)) URL.revokeObjectURL(src);
                }
            );

            if (isBlobUrl(config.logoImage)) URL.revokeObjectURL(config.logoImage);
            if (isBlobUrl(config.campusImage)) URL.revokeObjectURL(config.campusImage);
        };
    }, []);

    const updateField = <K extends keyof OverviewConfig>(key: K, value: OverviewConfig[K]) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const handleMultiImageUpload = (
        event: React.ChangeEvent<HTMLInputElement>,
        imageKey: "heroImages" | "campusGalleryImages" | "stackImages" | "chromaImages",
        setFilesArray: React.Dispatch<React.SetStateAction<File[]>>
    ) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        setFilesArray((prev) => [...prev, ...files]);

        const previews = files.map((file) => URL.createObjectURL(file));

        setConfig((prev) => ({
            ...prev,
            [imageKey]: [...prev[imageKey], ...previews],
        }));

        event.target.value = "";
        toast.success("Images selected for section");
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
        imageKey: "heroImages" | "campusGalleryImages" | "stackImages" | "chromaImages",
        setFilesArray?: React.Dispatch<React.SetStateAction<File[]>>
    ) => {
        const removed = config[imageKey][index];
        if (removed && isBlobUrl(removed)) URL.revokeObjectURL(removed);

        setConfig((prev) => ({
            ...prev,
            [imageKey]: prev[imageKey].filter((_, i) => i !== index),
        }));

        if (setFilesArray) {
            setFilesArray((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const formData = new FormData();

            const filterExisting = (urls: string[]) => urls.filter((src) => !isBlobUrl(src));

            formData.append("stackTitle", config.stackTitle);
            formData.append("stackSubtitle", config.stackSubtitle);
            formData.append("chromaTitle", config.chromaTitle);
            formData.append("chromaSubtitle", config.chromaSubtitle);

            formData.append("showStackSection", String(config.showStackSection));
            formData.append("showChromaSection", String(config.showChromaSection));

            formData.append("existingHeroImages", JSON.stringify(filterExisting(config.heroImages)));
            formData.append(
                "existingCampusGalleryImages",
                JSON.stringify(filterExisting(config.campusGalleryImages))
            );
            formData.append("existingStackImages", JSON.stringify(filterExisting(config.stackImages)));
            formData.append("existingChromaImages", JSON.stringify(filterExisting(config.chromaImages)));

            if (config.campusImage && !isBlobUrl(config.campusImage)) {
                formData.append("campusImage", config.campusImage);
            }

            if (config.logoImage && !isBlobUrl(config.logoImage)) {
                formData.append("logoImage", config.logoImage);
            }

            heroFiles.forEach((file) => formData.append("heroImages", file));
            campusGalleryFiles.forEach((file) => formData.append("campusGalleryImages", file));
            stackFiles.forEach((file) => formData.append("stackImages", file));
            chromaFiles.forEach((file) => formData.append("chromaImages", file));

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
            setStackFiles([]);
            setChromaFiles([]);
            setLogoFile(null);
            setCampusFile(null);

            window.dispatchEvent(new Event("overview-config-updated"));
            toast.success("All sections synced and saved successfully!");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Overview settings save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setConfig(defaultConfig);
        setHeroFiles([]);
        setCampusGalleryFiles([]);
        setStackFiles([]);
        setChromaFiles([]);
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
                        Landing page na sections ni images ane titles alagalag control karo.
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

                <SectionEditor
                    title="3. Stack Card Gallery Section"
                    active={config.showStackSection}
                    onToggle={() => updateField("showStackSection", !config.showStackSection)}
                >
                    <TextInput
                        label="Stack Main Title"
                        value={config.stackTitle}
                        onChange={(val) => updateField("stackTitle", val)}
                    />

                    <TextInput
                        label="Stack Subtitle"
                        value={config.stackSubtitle}
                        onChange={(val) => updateField("stackSubtitle", val)}
                    />

                    <MultiImageUploadView
                        label="Stack Rotating Cards Images"
                        images={config.stackImages}
                        onUpload={(e) => handleMultiImageUpload(e, "stackImages", setStackFiles)}
                        onRemove={(idx) => removeImageFromSection(idx, "stackImages", setStackFiles)}
                    />
                </SectionEditor>

                <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-red-100 pb-2">
                        <h2 className="text-lg font-black text-red-800">
                            4. Chroma Spotlight Highlights
                        </h2>

                        <ToggleButton
                            active={config.showChromaSection}
                            onClick={() => updateField("showChromaSection", !config.showChromaSection)}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <TextInput
                            label="Chroma Card Title"
                            value={config.chromaTitle}
                            onChange={(val) => updateField("chromaTitle", val)}
                        />

                        <TextInput
                            label="Chroma Card Subtitle"
                            value={config.chromaSubtitle}
                            onChange={(val) => updateField("chromaSubtitle", val)}
                        />

                        <div className="md:col-span-2">
                            <MultiImageUploadView
                                label="Chroma Grid Layout Images"
                                images={config.chromaImages}
                                onUpload={(e) => handleMultiImageUpload(e, "chromaImages", setChromaFiles)}
                                onRemove={(idx) => removeImageFromSection(idx, "chromaImages", setChromaFiles)}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function SectionEditor({
    title,
    active,
    onToggle,
    children,
}: {
    title: string;
    active: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-red-50 pb-2">
                <h2 className="text-lg font-black text-red-800">{title}</h2>
                <ToggleButton active={active} onClick={onToggle} />
            </div>
            <div className="grid gap-4">{children}</div>
        </section>
    );
}

function TextInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-red-800">
                {label}
            </span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-12 w-full rounded-xl border border-red-100 bg-white px-4 text-sm font-bold text-red-900 outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-100"
            />
        </label>
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
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
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

function ToggleButton({ active, onClick }: { active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                active ? "bg-red-800 text-white" : "border border-red-200 bg-white text-red-800"
            }`}
        >
            {active ? <FaEye /> : <FaEyeSlash />}
            {active ? "Show" : "Hide"}
        </button>
    );
}