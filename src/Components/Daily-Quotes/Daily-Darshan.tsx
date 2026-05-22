'use client';

import { useState, useCallback, useRef, useEffect, useMemo, type ChangeEvent } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Sun,
  Heart,
  Star,
  Zap,
  BookOpen,
  Quote,
  CircleCheck as CheckCircle2,
  Sunrise,
  Hand,
  Target,
  Flower2,
  Smile,
  Image as ImageIcon,
  Upload,
  Save,
  X,
  Trash2,
} from 'lucide-react';
import Lightbox from './Lightbox';

const GALLERY_MIN_SLOTS = 8;
const STORAGE_KEY = 'darshan_custom_images';

const isDataUrl = (src: string | null | undefined): boolean =>
  Boolean(src && src.startsWith('data:'));
const benefits = [
  { icon: Heart, label: 'Peace of Mind', description: 'Calm the mind and find inner stillness through divine sight.' },
  { icon: Star, label: 'Stronger Faith', description: 'Deepen your devotion and connection with Bhagwan every day.' },
  { icon: Zap, label: 'Positive Energy', description: 'Fill your day with divine vibrations and renewed vitality.' },
  { icon: Sun, label: 'Daily Inspiration', description: "Draw wisdom and motivation from the Lord's divine presence." },
];
const routine = [
  { icon: Sunrise, step: '01', title: 'Wake Early', desc: 'Rise before sunrise — embrace the sacred morning hours (Brahma Muhurta).' },
  { icon: Hand, step: '02', title: 'Perform Puja', desc: 'Offer flowers, incense, and prayers at your home mandir.' },
  { icon: Target, step: '03', title: 'View Darshan', desc: 'Gaze upon the divine image with full devotion and a still mind.' },
  { icon: Flower2, step: '04', title: 'Offer Prayer', desc: 'Recite a shloka or mantra to strengthen your spiritual bond.' },
  { icon: Smile, step: '05', title: 'Begin with Gratitude', desc: 'Carry divine blessings forward into every action of the day.' },
];
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};
const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
const emptyMinSlots = (): Array<string | null> => Array(GALLERY_MIN_SLOTS).fill(null);

/** Load slots from localStorage (supports legacy gallery object format) */
const loadSavedSlots = (raw: string | null): Array<string | null> => {
  if (!raw) return emptyMinSlots();
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return emptyMinSlots();

    const slots: Array<string | null> = parsed.map((item) => {
      if (typeof item === 'string' && isDataUrl(item)) return item;
      if (item && typeof item === 'object' && typeof item.src === 'string' && isDataUrl(item.src)) {
        return item.src;
      }
      return null;
    });

    if (!slots.some(isDataUrl)) return emptyMinSlots();
    while (slots.length < GALLERY_MIN_SLOTS) slots.push(null);
    return slots;
  } catch {
    return emptyMinSlots();
  }
};

export default function DailyDarshan() {
  const [boxSlots, setBoxSlots] = useState<Array<string | null>>(emptyMinSlots);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [brokenSlots, setBrokenSlots] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filledSlots = useMemo(
    () =>
      boxSlots
        .map((src, index) => (isDataUrl(src) ? { src: src!, title: `Daily Darshan ${index + 1}` } : null))
        .filter((item): item is { src: string; title: string } => item !== null),
    [boxSlots]
  );

  const savedCount = boxSlots.filter(isDataUrl).length;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setBoxSlots(loadSavedSlots(raw));
    } catch (err) {
      console.error('Failed to load saved Darshan images', err);
    }
  }, []);

  const persistSlots = (slots: Array<string | null>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
    }
  };
  const handleSelectPhotos = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    try {
      const dataUrls = await Promise.all(Array.from(files).map(readFileAsDataUrl));
      setSelectedPhotos(dataUrls);
    } catch (err) {
      console.error('Failed to read selected files', err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  /** Fill empty slots first, then add more boxes (grid grows) */
  const handleSavePhotos = () => {
    if (selectedPhotos.length === 0) return;

    const next = [...boxSlots];
    let photoIndex = 0;

    for (let i = 0; i < next.length && photoIndex < selectedPhotos.length; i++) {
      if (!isDataUrl(next[i])) {
        next[i] = selectedPhotos[photoIndex];
        photoIndex++;
      }
    }

    while (photoIndex < selectedPhotos.length) {
      next.push(selectedPhotos[photoIndex]);
      photoIndex++;
    }

    setBoxSlots(next);
    setSelectedPhotos([]);
    setBrokenSlots(new Set());
    persistSlots(next);
  };

  const handleDeleteAllImages = () => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('Remove all gallery images?');
      if (!ok) return;
    }
    const cleared = emptyMinSlots();
    setBoxSlots(cleared);
    setSelectedPhotos([]);
    setLightboxIndex(null);
    setBrokenSlots(new Set());
    persistSlots(cleared);
  };

  const handleRemoveSelected = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearSlot = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const next = [...boxSlots];
    next[index] = null;
    setBoxSlots(next);
    setBrokenSlots((prev) => {
      const s = new Set(prev);
      s.delete(index);
      return s;
    });
    setLightboxIndex(null);
    persistSlots(next);
  };

  const openLightboxForSlot = (slotIndex: number) => {
    const src = boxSlots[slotIndex];
    if (!isDataUrl(src)) return;
    const idx = filledSlots.findIndex((item) => item.src === src);
    if (idx >= 0) setLightboxIndex(idx);
  };

  const markBroken = (index: number) => {
    setBrokenSlots((prev) => new Set(prev).add(index));
  };

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goNext = useCallback(
    () =>
      setLightboxIndex((prev) =>
        prev === null ? 0 : (prev + 1) % filledSlots.length
      ),
    [filledSlots.length]
  );
  const goPrev = useCallback(
    () =>
      setLightboxIndex((prev) =>
        prev === null ? 0 : (prev - 1 + filledSlots.length) % filledSlots.length
      ),
    [filledSlots.length]
  );
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
      {/* 1. HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-400 via-red-800 to-red-400 px-4 py-24 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-red-500 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-red-800 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 shadow-xl"
          >
            <Sun className="h-10 w-10 text-red-300" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-3 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
          >
            Daily Darshan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mb-6 text-lg font-medium text-white/85 sm:text-xl"
          >
            Experience Divine Presence Every Day
          </motion.p>
          <motion.blockquote
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="mx-auto max-w-lg"
          >
            <Quote className="mx-auto mb-3 h-6 w-6 text-white/50" />
            <p className="text-base italic text-white/90 sm:text-lg">
              &ldquo;Begin every day with the blessings of Bhagwan.&rdquo;
            </p>
          </motion.blockquote>
        </div>
      </section>
      {/* 2. TODAY'S MESSAGE */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-100 to-amber-50 p-8 shadow-md sm:p-10"
        >
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-red-200/60 blur-2xl" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 shadow">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-red-800 sm:text-2xl">Today&apos;s Message</h2>
            </div>
            <p className="leading-relaxed text-gray-700 sm:text-lg">
              In the Swaminarayan tradition, Daily Darshan is more than just viewing an image — it is a
              sacred communion between the devotee&apos;s soul and Bhagwan. When we take darshan with purity
              of heart and full concentration, we receive divine blessings that protect us through the day.
              Let every glance be an offering, and every breath a prayer.
            </p>
          </div>
        </motion.div>
      </section>
      {/* 3. IMPORTANCE */}
      <section className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <div className="mb-3 flex items-center justify-center gap-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-400" />
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-600">
                Significance
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">Importance of Daily Darshan</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {[
              'Darshan purifies the mind and liberates the soul from impurities accumulated over time, aligning the devotee with divine consciousness.',
              "According to Swaminarayan scriptures, the eyes are the gateway to the soul — beholding the divine form plants seeds of devotion that bear fruit throughout one's life.",
              'Regular darshan cultivates consistency in spiritual practice, forming a sacred habit that transforms one\'s character and outlook on life.',
              'The physical image of Bhagwan serves as a focal point for the wandering mind, gradually training it to remain fixed in higher awareness and devotion.',
            ].map((text, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex gap-4 rounded-2xl border border-red-100 bg-red-50/60 p-5"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <p className="text-sm leading-relaxed text-gray-700 sm:text-base">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* 4. BENEFITS */}
      <section className="bg-gradient-to-br from-red-50 to-amber-50 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <div className="mb-3 flex items-center justify-center gap-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-500" />
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-500">
                Benefits
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">Blessings of Daily Darshan</h2>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, label, description }, i) => (
              <motion.div
                key={label}
                custom={i}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="group flex flex-col items-center rounded-2xl border border-orange-200/60 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-2 text-base font-bold text-gray-800">{label}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* 5. DAILY ROUTINE */}
      <section className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <div className="mb-3 flex items-center justify-center gap-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-500" />
              <span className="rounded-full bg-red-300 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-600">
                Routine
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">Daily Spiritual Practice</h2>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {routine.map(({ icon: Icon, step, title, desc }, i) => (
              <motion.div
                key={step}
                custom={i}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative flex flex-col items-center rounded-2xl border border-red-100 bg-gradient-to-b from-red-50 to-white p-5 text-center shadow-sm"
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white shadow">
                  {step}
                </span>
                <div className="mb-3 mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-gray-800">{title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* 6. CLOSING QUOTE BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-500 to-red-400 px-4 py-16 text-center text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative mx-auto max-w-3xl"
        >
          <Quote className="mx-auto mb-4 h-8 w-8 text-white/50" />
          <blockquote className="text-xl font-bold leading-relaxed sm:text-2xl md:text-3xl">
            &ldquo;One glance of the Divine can illuminate the entire day.&rdquo;
          </blockquote>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-white/40" />
        </motion.div>
      </section>
      {/* 7. GALLERY — box cards (8 min, grows when you save more) */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-400" />
            <span className="rounded-full bg-red-300 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-600">
              Gallery
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">Daily Darshan Gallery</h2>
          <p className="mt-2 text-sm text-gray-500">
            {boxSlots.length} {boxSlots.length === 1 ? 'box' : 'boxes'} · {savedCount} with photos — Save adds images to cards
          </p>
        </motion.div>
        <div className="mb-8 flex flex-wrap justify-center gap-4 sm:justify-start">
          <motion.button
            type="button"
            onClick={handleSelectPhotos}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <Upload className="h-5 w-5" />
            Select Photos
          </motion.button>
          <motion.button
            type="button"
            onClick={handleSavePhotos}
            disabled={selectedPhotos.length === 0}
            whileHover={selectedPhotos.length > 0 ? { scale: 1.05 } : {}}
            whileTap={selectedPhotos.length > 0 ? { scale: 0.95 } : {}}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold shadow-lg transition-all ${
              selectedPhotos.length > 0
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-xl'
                : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
          >
            <Save className="h-5 w-5" />
            Save Photos ({selectedPhotos.length})
          </motion.button>
          <motion.button
            type="button"
            onClick={handleDeleteAllImages}
            disabled={savedCount === 0}
            whileHover={savedCount > 0 ? { scale: 1.03 } : {}}
            whileTap={savedCount > 0 ? { scale: 0.97 } : {}}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold shadow-sm transition-all ${
              savedCount > 0
                ? 'border-red-300 bg-white/90 text-red-600 hover:shadow-md'
                : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            Delete Images
          </motion.button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Select photo files"
        />
        {selectedPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-6"
          >
            <h3 className="mb-4 text-lg font-bold text-red-900">
              Selected Photos ({selectedPhotos.length}) — Save to show on box cards
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {selectedPhotos.map((photo, index) => (
                <motion.div
                  key={`selected-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-white shadow-md"
                >
                  <img src={photo} alt={`Selected ${index + 1}`} className="h-full w-full object-cover" />
                  <motion.button
                    type="button"
                    onClick={() => handleRemoveSelected(index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {boxSlots.map((src, index) => {
            const title = `Daily Darshan ${index + 1}`;
            const hasImage = isDataUrl(src) && !brokenSlots.has(index);

            return (
              <motion.div
                key={`darshan-box-${index}`}
                custom={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                className={`group relative overflow-hidden rounded-2xl bg-white shadow-md transition-shadow duration-300 ${
                  hasImage ? 'cursor-pointer hover:shadow-xl' : ''
                }`}
                onClick={() => hasImage && openLightboxForSlot(index)}
                role={hasImage ? 'button' : undefined}
                tabIndex={hasImage ? 0 : undefined}
                aria-label={hasImage ? `Open ${title}` : title}
                onKeyDown={(e) => e.key === 'Enter' && hasImage && openLightboxForSlot(index)}
              >
                <div className="relative aspect-square overflow-hidden">
                  {hasImage ? (
                    <>
                      <img
                        src={src!}
                        alt={title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={() => markBroken(index)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
                        <div className="scale-0 rounded-full bg-white/90 p-2 shadow-lg transition-transform duration-300 group-hover:scale-100">
                          <Sun className="h-5 w-5 text-red-500" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-red-400 via-red-500 to-red-600 p-3 text-center">
                      <ImageIcon className="h-12 w-12 text-white/80" />
                      <span className="text-xs font-semibold text-white/90">{title}</span>
                      <span className="text-[10px] text-white/70">Empty slot</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-red-100 px-3 py-2.5">
                  <p className="truncate text-xs font-semibold text-gray-700">{title}</p>
                </div>
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-500 via-red-400 to-red-300" />
                {hasImage && (
                  <button
                    type="button"
                    onClick={(e) => handleClearSlot(index, e)}
                    className="absolute right-2 top-2 z-20 rounded-full bg-white/90 p-1.5 text-red-600 opacity-0 shadow transition-opacity group-hover:opacity-100"
                    aria-label={`Clear ${title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>
      {lightboxIndex !== null && filledSlots.length > 0 && (
        <Lightbox
          images={filledSlots}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={goNext}
          onPrev={goPrev}
        />
      )}
    </div>
  );
}