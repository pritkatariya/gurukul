import React, { useState, useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import { motion, type Variants } from 'framer-motion';
import { BookOpen, Sparkles, Quote, Calendar, Upload, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Lightbox from './Lightbox';

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
    preview: string; // Preview URL સ્ટોર કરવા માટે
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

    // Memory Leak અટકાવવા માટે Cleanup
    useEffect(() => {
        return () => {
            selectedPhotos.forEach((item) => URL.revokeObjectURL(item.preview));
        };
    }, [selectedPhotos]);

    const fetchImages = useCallback(async () => {
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
        }
    }, []);

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
        if (selectedPhotos.length === 0) return toast.error('Please select photos');
        if (!title) return toast.error('Please enter a title'); // વેલિડેશન

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title); // અહિયાં સ્ટેટમાંથી ટાઈટલ લીધું
            formData.append('image', selectedPhotos[0].file);

            await fetch(`${API_URL}/amrut-images`, {
                method: 'POST',
                body: formData,
            });
            toast.success('Uploaded!');
            setTitle(''); // રીસેટ કરો
            setSelectedPhotos([]);
            fetchImages();
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setLoading(false);
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
                <div className="bg-amber-600 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl">

                    {/* Left: Image Box */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-40 h-40 flex-shrink-0 border-2 border-white/20 flex items-center justify-center rounded-2xl bg-amber-700 text-white cursor-pointer overflow-hidden hover:scale-105 transition-transform"
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
                            className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-amber-200 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        {selectedPhotos.length > 0 && (
                            <button
                                onClick={handleSavePhotos}
                                disabled={loading}
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-bold transition"
                            >
                                {loading ? 'સચવાય છે...' : 'Save Image'}
                            </button>
                        )}
                    </div>
                </div>
            </section>
            <section className="mx-auto max-w-4xl px-4 py-16">
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {images.map((image, index) => (
                        <motion.div
                            key={image.id}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                        >
                            <img src={image.src} alt={image.title} className="w-full h-48 object-cover" />
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