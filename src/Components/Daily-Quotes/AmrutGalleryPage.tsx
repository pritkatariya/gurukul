'use client';

import React, {
    useState,
    useCallback,
    useEffect,
    useRef,
    type ChangeEvent,
} from 'react';

import { motion, type Variants } from 'framer-motion';

import {
    BookOpen,
    Sparkles,
    Quote,
    Calendar,
    Upload,
    Save,
    Trash2,
} from 'lucide-react';

import { toast } from 'sonner';

import Lightbox from './Lightbox';

const API_URL = (
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000'
).replace(/\/$/, '');

interface GalleryImage {
    id?: number;
    src: string;
    title: string;
    date?: string;
    isCustom?: boolean;
}

const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 24,
    },

    visible: (i: number) => ({
        opacity: 1,
        y: 0,

        transition: {
            delay: i * 0.07,
            duration: 0.45,
            ease: [0.25, 0.1, 0.25, 1] as const,
        },
    }),
};

export default function AmrutGalleryPage() {
    const [lightboxIndex, setLightboxIndex] =
        useState<number | null>(null);

    const [images, setImages] = useState<GalleryImage[]>([]);

    const [selectedPhotos, setSelectedPhotos] =
        useState<File[]>([]);

    const [loading, setLoading] = useState(false);

    const fileInputRef =
        useRef<HTMLInputElement | null>(null);

    const openLightbox = useCallback(
        (index: number) => {
            setLightboxIndex(index);
        },
        []
    );

    const closeLightbox = useCallback(() => {
        setLightboxIndex(null);
    }, []);

    const goNext = useCallback(() => {
        setLightboxIndex((prev) =>
            prev === null
                ? 0
                : (prev + 1) % images.length
        );
    }, [images.length]);

    const goPrev = useCallback(() => {
        setLightboxIndex((prev) =>
            prev === null
                ? 0
                : (prev - 1 + images.length) %
                images.length
        );
    }, [images.length]);

    const fetchImages = async () => {
        try {
            const response = await fetch(
                `${API_URL}/amrut-images`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                return;
            }

            const formattedImages: GalleryImage[] =
                data.data.map((item: { id: number; url: string; title: string; created_at: string }) => ({
                    id: item.id,
                    src: item.url,
                    title: item.title,
                    date: new Date(
                        item.created_at
                    ).toLocaleDateString(),
                    isCustom: true,
                }));

            setImages(formattedImages);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleSelectPhoto = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files;

        if (!files || files.length === 0) {
            return;
        }

        setSelectedPhotos((prev) => [
            ...prev,
            ...Array.from(files),
        ]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSavePhotos =
        async (): Promise<void> => {
            try {
                if (selectedPhotos.length === 0) {
                    toast.error(
                        'Please select photos'
                    );
                    return;
                }

                setLoading(true);

                for (const photo of selectedPhotos) {
                    const formData = new FormData();

                    formData.append(
                        'title',
                        `Amrut Nu Aachaman ${Date.now()}`
                    );

                    formData.append(
                        'image',
                        photo
                    );

                    const response = await fetch(
                        `${API_URL}/amrut-images`,
                        {
                            method: 'POST',
                            body: formData,
                        }
                    );

                    const data = await response.json();

                    if (
                        !response.ok ||
                        !data.success
                    ) {
                        throw new Error(
                            data.message ||
                            'Upload failed'
                        );
                    }
                }

                toast.success(
                    'Photos uploaded successfully'
                );

                setSelectedPhotos([]);

                fetchImages();
            } catch (error) {
                console.error(error);

                toast.error(
                    'Failed to upload photos'
                );
            } finally {
                setLoading(false);
            }
        };

    const handleRemoveSelectedPhoto = (
        index: number
    ) => {
        setSelectedPhotos((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    const handleDeleteCustomImage = async (id?: number) => {
        try {
            if (!id) return;

            const response = await fetch(
                `${API_URL}/amrut-images/${id}`,
                {
                    method: 'DELETE',
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    'Delete failed'
                );
            }

            toast.success(
                'Image deleted successfully'
            );

            fetchImages();
        } catch (error) {
            console.error(error);

            toast.error(
                'Failed to delete image'
            );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-500 to-red-800 px-4 py-20 text-white">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
                        backgroundSize:
                            '24px 24px',
                    }}
                />

                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-red-900 blur-3xl" />

                <div className="relative mx-auto max-w-4xl text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 15,
                        }}
                        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 shadow-lg ring-4 ring-white/30"
                    >
                        <BookOpen className="h-10 w-10 text-white" />
                    </motion.div>

                    <motion.h1
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.15,
                        }}
                        className="mb-2 text-3xl font-bold tracking-wide sm:text-4xl md:text-5xl"
                        lang="gu"
                    >
                        અમૃતનું આચમન
                    </motion.h1>

                    <motion.h2
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.22,
                        }}
                        className="mb-4 text-xl font-semibold text-white/90 sm:text-2xl"
                    >
                        Amrut Nu Aachaman
                    </motion.h2>

                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.9,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        transition={{
                            delay: 0.3,
                        }}
                        className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
                    >
                        <Sparkles className="h-4 w-4 text-white/80" />

                        Daily Spiritual Wisdom
                    </motion.div>

                    <motion.blockquote
                        initial={{
                            opacity: 0,
                            y: 16,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.38,
                        }}
                        className="mx-auto max-w-xl"
                    >
                        <Quote className="mx-auto mb-3 h-7 w-7 text-white/50" />

                        <p className="text-lg italic leading-relaxed text-white/90 sm:text-xl">
                            &ldquo;Read a few words
                            daily, and let divine
                            wisdom transform your
                            life.&rdquo;
                        </p>
                    </motion.blockquote>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        once: true,
                    }}
                    transition={{
                        duration: 0.5,
                    }}
                    className="mb-12 text-center"
                >
                    <div className="mb-3 flex items-center justify-center gap-2">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-400" />

                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-600">
                            Gallery
                        </span>

                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-400" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                        Daily Wisdom Collection
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                        Click any image to view in
                        full screen
                    </p>
                </motion.div>

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 12,
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        once: true,
                    }}
                    transition={{
                        duration: 0.4,
                    }}
                    className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                >
                    <button
                        type="button"
                        onClick={
                            handleSelectPhoto
                        }
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-300 bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-700"
                    >
                        <Upload className="h-4 w-4" />

                        Select Photos
                    </button>

                    <button
                        type="button"
                        onClick={
                            handleSavePhotos
                        }
                        disabled={
                            loading ||
                            selectedPhotos.length === 0
                        }
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-800 bg-red-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />

                        {loading
                            ? 'Uploading...'
                            : 'Save Photos'}

                        {selectedPhotos.length >
                            0 && (
                                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                                    {
                                        selectedPhotos.length
                                    }
                                </span>
                            )}
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={
                            handleFileChange
                        }
                        className="hidden"
                    />
                </motion.div>

                {selectedPhotos.length >
                    0 && (
                        <div className="mb-10 flex flex-wrap justify-center gap-3">
                            {selectedPhotos.map(
                                (photo, index) => (
                                    <div
                                        key={index}
                                        className="relative"
                                    >
                                        <img
                                            src={URL.createObjectURL(
                                                photo
                                            )}
                                            alt="preview"
                                            className="h-20 w-20 rounded-xl border-2 border-red-200 object-cover shadow-sm"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveSelectedPhoto(
                                                    index
                                                )
                                            }
                                            className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-700 shadow-md"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {images.map(
                        (image, index) => (
                            <motion.div
                                key={
                                    image.id ||
                                    index
                                }
                                custom={index}
                                variants={
                                    cardVariants
                                }
                                initial="hidden"
                                whileInView="visible"
                                viewport={{
                                    once: true,
                                    margin:
                                        '-40px',
                                }}
                                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl"
                                onClick={() =>
                                    openLightbox(
                                        index
                                    )
                                }
                            >
                                <div className="relative aspect-square overflow-hidden">
                                    <img
                                        src={
                                            image.src
                                        }
                                        alt={
                                            image.title
                                        }
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />

                                    <button
                                        type="button"
                                        onClick={(
                                            e
                                        ) => {
                                            e.stopPropagation();

                                            handleDeleteCustomImage(image.id);
                                        }}
                                        className="absolute right-2 top-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-700 shadow-sm opacity-0 transition group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
                                        <div className="scale-0 rounded-full bg-white/90 p-2 transition-transform duration-300 group-hover:scale-100">
                                            <Sparkles className="h-5 w-5 text-red-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-red-500 px-3 py-2.5">
                                    <p className="truncate text-xs font-semibold text-gray-700">
                                        {image.title}
                                    </p>

                                    {image.date && (
                                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                                            <Calendar className="h-3 w-3" />

                                            {image.date}
                                        </p>
                                    )}
                                </div>

                                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-500 via-red-400 to-red-800" />
                            </motion.div>
                        )
                    )}
                </div>

                {images.length ===
                    0 && (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50 py-24">
                            <BookOpen className="mb-4 h-12 w-12 text-red-300" />

                            <p className="text-base font-medium text-red-400">
                                No images uploaded
                                yet.
                            </p>
                        </div>
                    )}
            </section>

            {lightboxIndex !==
                null && (
                    <Lightbox
                        images={images}
                        currentIndex={
                            lightboxIndex
                        }
                        onClose={
                            closeLightbox
                        }
                        onNext={goNext}
                        onPrev={goPrev}
                    />
                )}
        </div>
    );
}