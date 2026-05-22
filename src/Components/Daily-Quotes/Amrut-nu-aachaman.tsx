'use client';

import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { BookOpen, Sparkles, Upload, Save, X, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const GALLERY_SLOT_COUNT = 8;
const STORAGE_KEY = 'amrut_custom_images';

const dailyPhotos = [
  '/images/amrut-nu-aachaman/photo1.jpg',
  '/images/amrut-nu-aachaman/photo2.jpg',
  '/images/amrut-nu-aachaman/photo3.jpg',
];

const emptySlots = (): Array<string | null> => Array(GALLERY_SLOT_COUNT).fill(null);

const isDataUrl = (src: string | null): boolean =>
  Boolean(src && src.startsWith('data:'));

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const normalizeFromStorage = (parsed: unknown): Array<string | null> => {
  if (!Array.isArray(parsed)) return emptySlots();

  const slots = parsed.map((item) => {
    if (typeof item === 'string' && isDataUrl(item)) return item;
    return null;
  });

  while (slots.length < GALLERY_SLOT_COUNT) slots.push(null);
  return slots.slice(0, GALLERY_SLOT_COUNT);
};

export default function AmrutNuAachaman() {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [boxImages, setBoxImages] = useState<Array<string | null>>(emptySlots);
  const [brokenSlots, setBrokenSlots] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setBoxImages(normalizeFromStorage(JSON.parse(raw)));
      }
    } catch (err) {
      console.error('Failed to load saved Amrut images', err);
    }
  }, []);

  const getBoxImageSrc = (index: number): string | null => {
    const custom = boxImages[index];
    if (isDataUrl(custom)) return custom;
    return dailyPhotos[index] ?? null;
  };

  const latestPhoto =
    [...boxImages].reverse().find(isDataUrl) ??
    dailyPhotos[dailyPhotos.length - 1] ??
    null;

  const savedCount = boxImages.filter(isDataUrl).length;

  const persist = (slots: Array<string | null>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
    }
  };

  const handleSelectPhotos = () => fileInputRef.current?.click();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    try {
      const dataUrls = await Promise.all(
        Array.from(files).slice(0, GALLERY_SLOT_COUNT).map(readFileAsDataUrl)
      );
      setSelectedPhotos(dataUrls);
    } catch (err) {
      console.error('Failed to read files', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSavePhotos = () => {
    if (selectedPhotos.length === 0) return;

    const next = [...boxImages];
    let insertAt = next.findIndex((src) => !isDataUrl(src));
    if (insertAt === -1) insertAt = 0;

    selectedPhotos.forEach((photo, i) => {
      const pos = insertAt + i;
      if (pos < GALLERY_SLOT_COUNT) next[pos] = photo;
    });

    setBoxImages(next);
    setSelectedPhotos([]);
    setBrokenSlots(new Set());
    persist(next);
  };

  const handleRemoveSelected = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearSlot = (index: number) => {
    const next = [...boxImages];
    next[index] = null;
    setBoxImages(next);
    setBrokenSlots((prev) => {
      const s = new Set(prev);
      s.delete(index);
      return s;
    });
    persist(next);
  };

  const markBroken = (index: number) => {
    setBrokenSlots((prev) => new Set(prev).add(index));
  };

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-red-500 via-red-400 to-red-600 p-6 shadow-2xl">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-red-600 via-red-400 to-red-800 opacity-10 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-white/10 shadow-inner ring-2 ring-white/30">
            {latestPhoto && !brokenSlots.has(-1) ? (
              <img
                src={latestPhoto}
                alt="Amrut Nu Aachaman"
                className="h-full w-full object-cover"
                onError={() => markBroken(-1)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/80">
                <BookOpen className="h-8 w-8" />
              </div>
            )}
            <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-white drop-shadow" />
          </div>
          <p className="text-center text-base font-bold text-white" lang="gu">
            અમૃતનું આચમન
          </p>
          <p className="text-center text-sm font-semibold text-white/90">Amrut Nu Aachaman</p>
          <p className="text-center text-xs text-white/70">Daily Spiritual Wisdom</p>
          <p className="text-center text-[10px] text-white/70">{savedCount} saved uploads</p>
          <Link
            to="/amrut-nu-aachaman"
            className="mt-2 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            Open Gallery
          </Link>
        </div>
      </div>

      {/* Upload panel */}
      <div className="rounded-3xl border border-red-300 bg-red-400 p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSelectPhotos}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            <Upload className="h-4 w-4" />
            Select Photos
          </button>
          <button
            type="button"
            onClick={handleSavePhotos}
            disabled={selectedPhotos.length === 0}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
              selectedPhotos.length > 0
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'cursor-not-allowed bg-gray-200 text-gray-500'
            }`}
          >
            <Save className="h-4 w-4" />
            Save Photos ({selectedPhotos.length})
          </button>
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
          <div className="space-y-4 rounded-3xl bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">Preview — click Save Photos to show on cards</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {selectedPhotos.map((photo, index) => (
                <div
                  key={`sel-${index}`}
                  className="relative overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <img src={photo} alt={`Selected ${index + 1}`} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveSelected(index)}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-red-600 shadow"
                    aria-label="Remove selected photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 8 gallery box cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {boxImages.map((_, index) => {
          const title = `Amrut Nu Aachaman ${index + 1}`;
          const hasCustom = isDataUrl(boxImages[index]);
          const displaySrc = hasCustom ? boxImages[index] : getBoxImageSrc(index);
          const showImage = hasCustom || (Boolean(displaySrc) && !brokenSlots.has(index));

          return (
            <div
              key={`box-card-${index}`}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="absolute left-0 top-0 z-10 h-1 w-full bg-gradient-to-r from-red-500 via-red-400 to-red-300" />

              <div className="relative aspect-square overflow-hidden bg-red-50">
                {showImage ? (
                  <img
                    src={displaySrc!}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() => !hasCustom && markBroken(index)}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-red-400 via-red-500 to-red-600 p-3 text-center">
                    <ImageIcon className="h-10 w-10 text-white/80" />
                    <span className="text-xs font-semibold text-white/90">Slot {index + 1}</span>
                    <span className="text-[10px] text-white/70">Empty slot</span>
                  </div>
                )}

                <div className="absolute left-2 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                  Slot {index + 1}
                </div>

                {hasCustom && (
                  <button
                    type="button"
                    onClick={() => handleClearSlot(index)}
                    className="absolute right-2 top-3 z-10 rounded-full bg-white/90 p-1.5 text-red-600 opacity-0 shadow transition-opacity group-hover:opacity-100"
                    aria-label={`Clear ${title}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="border-t border-red-100 px-3 py-2.5">
                <p className="truncate text-xs font-semibold text-gray-700">{title}</p>
                {hasCustom && (
                  <p className="mt-0.5 text-[10px] font-medium text-emerald-600">Saved</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
