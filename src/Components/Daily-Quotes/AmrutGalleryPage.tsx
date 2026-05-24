import { useState, useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import { motion, type Variants } from 'framer-motion';
import {Sparkles} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

interface GalleryImage {
    id: number;
    title: string;
    src: string;
    date?: string;
}

interface SelectedPhoto {
    file: File;
    title: string;
    preview: string;
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
    }),
};

export default function AmrutGalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Memory Leak અટકાવવા માટે Cleanup
    useEffect(() => {
        return () => {
            selectedPhotos.forEach((item) => URL.revokeObjectURL(item.preview));
        };
    }, [selectedPhotos]);

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/amrut-images`);
            const result = await response.json();

            if (result && result.success && Array.isArray(result.data)) {
                setImages(result.data);
            } else {
                setImages([]);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            setImages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // જૂની URL રિલીઝ કરો (Memory leak અટકાવવા)
        if (selectedPhotos.length > 0) {
            URL.revokeObjectURL(selectedPhotos[0].preview);
        }

        const file = files[0];
        const newPhoto = {
            file,
            title: file.name.split('.')[0],
            preview: URL.createObjectURL(file)
        };

        setSelectedPhotos([newPhoto]);
    };

    const handleSavePhotos = async () => {
        setErrorMessage(null);
        if (selectedPhotos.length === 0) return toast.error('Please select photos');
        if (!title.trim()) return toast.error('Please enter a title'); // validation

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('image', selectedPhotos[0].file);

            const resp = await fetch(`${API_URL}/amrut-images`, {
                method: 'POST',
                body: formData,
            });

            const result = await resp.json().catch(() => null);
            if (!resp.ok || !(result && result.success)) {
                const msg = result?.message || 'Upload failed';
                setErrorMessage(msg);
                toast.error(msg);
            } else {
                toast.success('Uploaded!');
                setTitle('');
                setSelectedPhotos([]);
                fetchImages();
            }
        } catch (error) {
            console.error('Upload Error:', error);
            setErrorMessage('Upload failed. Please try again.');
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-500 to-red-800 px-4 py-20 text-white text-center">
                <h1 className="text-3xl font-bold sm:text-5xl">અમૃતનું આચમન</h1>
            </section>

            <section className="mx-auto max-w-4xl px-4 py-16">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                {/* Main Card */}
                <div className=" rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl">

                    {/* Left: Image Box */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-40 h-40 shrink-0 border-2 border-dashed border-red-100 hover:border-red-800 bg-red-600 hover:bg-red-100 hover:text-gray-900 duration-100 flex items-center justify-center rounded-2xl text-white cursor-pointer overflow-hidden hover:scale-105 transition-transformm"
                    >
                        {selectedPhotos.length > 0 ? (
                            <img src={selectedPhotos[0].preview} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                            <Sparkles size={32} />
                        )}
                    </div>

                    {/* Right: Input Text Area */}
                    <div className="flex-grow w-full space-y-4">
                        <input
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            type="text"
                            placeholder="અમૃતનું શીર્ષક લખો..."
                            className="w-full p-3 rounded-xl bg-white/10 border-2 border-red-500 text-red-900 font-bold focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        {selectedPhotos.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleSavePhotos}
                                    disabled={uploading}
                                    aria-disabled={uploading}
                                    className={`w-full rounded-xl font-bold transition ${uploading ? 'bg-gray-300 text-gray-600' : 'bg-green-500 hover:bg-green-600 text-white py-2'}`}
                                >
                                    {uploading ? 'Saving...' : 'Save Image'}
                                </button>
                                {errorMessage && <p className="text-sm text-red-700">{errorMessage}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <section className="mx-auto max-w-4xl px-4 py-16">
                <motion.div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading && Array.from({ length: 6 }).map((_, i) => (
                        <div key={`skeleton-${i}`} className="animate-pulse rounded-2xl bg-white p-0 shadow">
                            <div className="h-40 w-full bg-gray-200" />
                            <div className="p-3">
                                <div className="h-4 w-3/4 bg-gray-200 mb-2" />
                                <div className="h-3 w-1/3 bg-gray-200" />
                            </div>
                        </div>
                    ))}

                    {!loading && images.length === 0 && (
                        <div className="col-span-full rounded-2xl bg-white p-6 text-center text-gray-600 shadow">
                            No images available yet.
                        </div>
                    )}

                    {!loading && images.map((image, index) => (
                        <motion.div
                            key={image.id}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            className="bg-white rounded-2xl overflow-hidden shadow-lg focus:ring-2 focus:ring-red-300"
                            tabIndex={0}
                            role="button"
                            aria-label={`Open ${image.title}`}
                            onKeyDown={(e) => e.key === 'Enter' && window.open(image.src, '_blank')}
                            onClick={() => window.open(image.src, '_blank')}
                        >
                            <img src={image.src} alt={image.title} loading="lazy" decoding="async" className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h2 className="text-lg font-bold">{image.title}</h2>
                                {image.date && <p className="text-sm text-gray-500">{new Date(image.date).toLocaleDateString()}</p>}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </div>
    );
}