import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Search,
} from "lucide-react";
import Lightbox from "../../Components/Daily-Quotes/Lightbox";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

interface GalleryImage {
  src: string;
  title: string;
  date?: string;
  fullDate?: string;
}

interface ApiImage {
  url: string;
  title?: string;
  created_at?: string;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },

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

export default function AmrutnuAchaman() {
  const [lightboxIndex, setLightboxIndex] =
    useState<number | null>(null);

  const [images, setImages] = useState<
    GalleryImage[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] =
    useState("");

  const openLightbox = useCallback(
    (index: number) => {
      setLightboxIndex(index);
    },
    []
  );

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const filteredImages = useMemo(() => {
    if (!selectedDate) return images;

    return images.filter(
      (img) => img.fullDate === selectedDate
    );
  }, [images, selectedDate]);

  const goNext = useCallback(() => {
    if (filteredImages.length === 0) return;

    setLightboxIndex((prev) =>
      prev === null
        ? 0
        : (prev + 1) % filteredImages.length
    );
  }, [filteredImages.length]);

  const goPrev = useCallback(() => {
    if (filteredImages.length === 0) return;

    setLightboxIndex((prev) =>
      prev === null
        ? 0
        : (prev - 1 + filteredImages.length) %
        filteredImages.length
    );
  }, [filteredImages.length]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/amrut-images`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch images"
          );
        }

        const data = await response.json();

        if (
          data.success &&
          Array.isArray(data.images)
        ) {
          const formatted: GalleryImage[] =
            data.images.map(
              (img: ApiImage, index: number) => {
                const createdDate = img.created_at
                  ? new Date(img.created_at)
                  : new Date();

                return {
                  src: img.url,
                  title:
                    img.title ||
                    `Daily Wisdom ${index + 1}`,
                  date:
                    createdDate.toLocaleDateString(
                      "en-GB"
                    ),
                  fullDate: createdDate
                    .toISOString()
                    .split("T")[0],
                };
              }
            );

          setImages(formatted);
        }
      } catch (error) {
        console.error(
          "Error fetching images:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white p-4 md:p-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-500 to-red-800 px-4 py-20 text-white">
        <Link
          to="/"
          className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/20 p-4 text-lg transition hover:bg-white hover:text-red-600"
        >
          <FaArrowLeft />
        </Link>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 shadow-lg ring-4 ring-white/30">
            <BookOpen className="h-10 w-10 text-white" />
          </motion.div>

          <h1
            className="mb-2 text-3xl font-bold tracking-wide sm:text-4xl md:text-5xl"
            lang="gu"
          >
            અમૃતનું આચમન
          </h1>

          <h2 className="mb-4 text-xl font-semibold text-white/90 sm:text-2xl">
            Amrut Nu Aachaman
          </h2>

          {/* DATE FILTER */}
          <div className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-2xl bg-white/15 p-3 backdrop-blur-md">
            <Calendar className="h-5 w-5 text-white" />

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-white/20 bg-white/20 px-4 py-2 text-white outline-none backdrop-blur-md"
            />

            <button
              onClick={() =>
                setSelectedDate("")
              }
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Clear
            </button>
          </div>

          {selectedDate && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm">
              <Search className="h-4 w-4" />

              Showing images for:
              <span className="font-semibold">
                {new Date(
                  selectedDate
                ).toLocaleDateString(
                  "en-GB"
                )}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* GALLERY */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="rounded-2xl bg-white px-8 py-5 shadow-lg">
              <p className="animate-pulse text-lg font-medium text-red-500">
                Loading images...
              </p>
            </div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-red-200 bg-red-50 py-24">
            <BookOpen className="mb-4 h-14 w-14 text-red-300" />

            <p className="text-lg font-semibold text-red-400">
              No images found
            </p>

            {selectedDate && (
              <p className="mt-2 text-sm text-gray-500">
                Try another date
              </p>
            )}
          </div>
        ) : (
          <>
            {/* RESULT COUNT */}
            <div className="mb-8  flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">
                Daily Wisdom Gallery
              </h3>

              <div className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
                {filteredImages.length} Images
              </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredImages.map(
                (image, index) => (
                  <motion.div
                    key={`${image.src}-${index}`}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{
                      once: true,
                    }}
                    whileHover={{ y: -5 }}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl"
                    onClick={() =>
                      openLightbox(index)
                    }
                  >
                    {/* IMAGE */}
                    <div className="relative aspect-square overflow-hidden bg-gray-200">
                      <img
                        src={image.src}
                        alt={image.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/20" />
                    </div>

                    {/* CONTENT */}
                    <div className="border-t border-red-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-gray-700">
                        {image.title}
                      </p>

                      {image.date && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />

                          {image.date}
                        </div>
                      )}
                    </div>

                    {/* TOP BORDER */}
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-500 via-red-400 to-red-800" />
                  </motion.div>
                )
              )}
            </div>
          </>
        )}
      </section>

      {/* LIGHTBOX */}
      {lightboxIndex !== null &&
        filteredImages.length > 0 && (
          <Lightbox
            images={filteredImages}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onNext={goNext}
            onPrev={goPrev}
          />
        )}
    </div>
  );
}