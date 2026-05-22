import { useEffect, useMemo, useState } from "react";
import ChromaGrid from "../Components/ChromaGrid";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import "../App.css";
import { GiPagoda } from "react-icons/gi";
import {
    FaArrowRight,
    FaChevronLeft,
    FaChevronRight,
    FaPlay,
    FaVolumeDown,
    FaVolumeUp,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Stack from "./Stack";
import ElasticSlider from "../Components/ElasticSlider";
import { useMusic } from "../Components/MusicProvider";

import LogoImg from "../assets/gurukul logo.png";
import BhayavadarImg from "../assets/Bhayavadar.png";
import SwaminarayanSceneImg from "../assets/swaminarayan-blessing.png";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

type OverviewApiConfig = {
    heroTitle: string;
    heroSubtitle: string;
    heroImages: string[];
    logoImage: string;
    campusImage: string;
    campusGalleryImages: string[];
    stackTitle: string;
    stackSubtitle: string;
    stackImages: string[];
    showStackSection: boolean;
    domeTitle: string;
    domeSubtitle: string;
    domeImages: string[];
    showDomeSection: boolean;
    chromaTitle: string;
    chromaSubtitle: string;
    chromaImages: string[];
    showChromaSection: boolean;
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 34 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
    },
};

function AnimatedSectionBackground() {
    return (
        <>
            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, #991b1b 1.5px, transparent 1.5px), linear-gradient(to bottom, #991b1b 1.5px, transparent 1.5px)",
                    backgroundSize: "45px 45px",
                    backgroundAttachment: "fixed",
                    backgroundPosition: "0 0",
                }}
            />

            <motion.div
                animate={{ x: [0, 24, 0], y: [0, 16, 0], scale: [1, 1.04, 1] }}
                transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
                className="fixed -left-28 top-12 h-80 w-80 rounded-full bg-red-200/20 blur-[95px] pointer-events-none md:h-[34rem] md:w-[34rem]"
            />

            <motion.div
                animate={{ x: [0, -24, 0], y: [0, 26, 0], scale: [1, 1.03, 1] }}
                transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
                className="fixed -right-24 bottom-20 h-80 w-80 rounded-full bg-red-300/20 blur-[110px] pointer-events-none md:h-[36rem] md:w-[36rem]"
            />
        </>
    );
}

export default function Overview() {
    const [loading, setLoading] = useState(true);
    const [logoDocked, setLogoDocked] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);
    const [overviewConfig, setOverviewConfig] = useState<OverviewApiConfig | null>(null);

    const { isMusicPlaying, toggleMusic, volume, setVolume, playMusic } = useMusic();

    useEffect(() => {
        const loadOverviewConfig = async () => {
            try {
                const response = await fetch(`${API_URL}/overview/config`);
                const data = await response.json();

                if (data.success) {
                    setOverviewConfig(data.config);
                }
            } catch (error) {
                console.error(error);
            }
        };

        loadOverviewConfig();

        const handleUpdated = () => loadOverviewConfig();
        window.addEventListener("overview-config-updated", handleUpdated);

        return () => window.removeEventListener("overview-config-updated", handleUpdated);
    }, []);

    useEffect(() => {
        const fetchAndPlayDefaultTrack = async () => {
            try {
                const res = await fetch(`${API_URL}/music/songs`);
                const data = await res.json();

                if (data.success && data.songs.length > 0) {
                    window.dispatchEvent(
                        new CustomEvent("change-gurukul-track", {
                            detail: data.songs[0].audio_url,
                        })
                    );
                }
            } catch (err) {
                console.error("Error setting default background track:", err);
            }
        };

        fetchAndPlayDefaultTrack();
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setLogoDocked(true);
            setLoading(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const resolvedLogoImg = overviewConfig?.logoImage || LogoImg;
    const resolvedCampusImg = overviewConfig?.campusImage || BhayavadarImg;

    const heroImages = useMemo(
        () =>
            overviewConfig?.heroImages?.length
                ? overviewConfig.heroImages
                : [SwaminarayanSceneImg, BhayavadarImg, SwaminarayanSceneImg, BhayavadarImg],
        [overviewConfig]
    );

    const campusGalleryImages = useMemo(
        () =>
            overviewConfig?.campusGalleryImages?.length
                ? overviewConfig.campusGalleryImages
                : [BhayavadarImg, SwaminarayanSceneImg],
        [overviewConfig]
    );

    const stackImageList = useMemo(
        () =>
            overviewConfig?.stackImages?.length
                ? overviewConfig.stackImages
                : [heroImages[0], resolvedCampusImg, resolvedLogoImg, BhayavadarImg],
        [overviewConfig, heroImages, resolvedCampusImg, resolvedLogoImg]
    );

    const stackCards = useMemo(
        () =>
            stackImageList.map((src, index) => (
                <div key={`${src}-${index}`} className="relative h-full w-full overflow-hidden shadow-2xl backdrop-blur-3xl rounded-2xl">
                    <img
                        src={src}
                        alt={`Gurukul card ${index + 1}`}
                        className="h-full w-full object-cover pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-red-950/55 via-transparent to-transparent" />
                </div>
            )),
        [stackImageList]
    );

    const chromaItems = useMemo(() => {
        const images = overviewConfig?.chromaImages?.length
            ? overviewConfig.chromaImages
            : [SwaminarayanSceneImg, BhayavadarImg, LogoImg, SwaminarayanSceneImg, BhayavadarImg, LogoImg];

        const titles = [
            "Divine Blessings",
            "Bhayavadar Gurukul",
            "Gurukul Parampara",
            "Aashirvad",
            "Campus Life",
            "Shree Gurukul",
        ];

        const subtitles = [
            "Bhagwan Swaminarayan",
            "Sanskar ane Shikshan",
            "Bhakti, Vidya, Seva",
            "Shanti ane Shraddha",
            "Learning with Values",
            "Red and White Theme",
        ];

        const colors = ["#DC2626", "#991B1B", "#EF4444", "#F87171", "#B91C1C", "#FCA5A5"];

        return images.map((image, index) => ({
            image,
            title: titles[index % titles.length],
            subtitle: subtitles[index % subtitles.length],
            handle: "@gurukul",
            location: index % 2 === 0 ? "Gurukul" : "Bhayavadar",
            borderColor: colors[index % colors.length],
            gradient: `linear-gradient(145deg, ${colors[index % colors.length]}, #120F17)`,
        }));
    }, [overviewConfig]);

    useEffect(() => {
        if (loading || heroImages.length === 0) return;

        const interval = window.setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [loading, heroImages.length]);

    const goToPrevHero = () => {
        setHeroIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));
    };

    const goToNextHero = () => {
        setHeroIndex((prev) => (prev + 1) % heroImages.length);
    };

    const handleStart = () => {
        setLogoDocked(true);
        setLoading(false);

        setTimeout(() => {
            playMusic();
        }, 300);
    };

    return (
        <>
            <AnimatePresence>
                {loading && (
                    <motion.div
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-red-900 select-none"
                        exit={{
                            opacity: 0,
                            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
                        }}
                    >
                        <div
                            className="absolute inset-0 opacity-[0.035] pointer-events-none"
                            style={{
                                backgroundImage:
                                    "linear-gradient(to right, #ffffff 1.5px, transparent 1.5px), linear-gradient(to bottom, #ffffff 1.5px, transparent 1.5px)",
                                backgroundSize: "45px 45px",
                            }}
                        />

                        <div className="relative flex flex-col items-center justify-center">
                            <motion.div
                                initial={{ scale: 0.85, opacity: 0 }}
                                animate={{ scale: 1.12, opacity: 0.18 }}
                                transition={{
                                    duration: 3.2,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    ease: "easeInOut",
                                }}
                                className="absolute h-64 w-64 rounded-full bg-white blur-3xl pointer-events-none"
                            />

                            <motion.div
                                layoutId="gurukul-main-logo"
                                initial={{
                                    opacity: 0,
                                    scale: 0.35,
                                    rotate: -8,
                                    filter: "blur(10px)",
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    rotate: 0,
                                    filter: "blur(0px)",
                                }}
                                transition={{ duration: 1.3, ease: [0.34, 1.56, 0.64, 1] }}
                                className="z-10 flex h-32 w-32 items-center justify-center rounded-[40px] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-md md:h-40 md:w-40"
                            >
                                <img
                                    src={resolvedLogoImg}
                                    className="h-full w-full object-contain"
                                    alt="Gurukul Main Logo"
                                />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45, duration: 0.9, ease: "easeOut" }}
                                className="mt-6 text-center text-3xl font-black tracking-widest text-white md:text-4xl"
                            >
                                GURUKUL
                            </motion.h2>

                            <motion.button
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.75, duration: 0.75 }}
                                onClick={handleStart}
                                className="z-50 mt-6 flex cursor-pointer items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-red-900 shadow-lg transition-all hover:scale-105 hover:bg-gray-100 active:scale-95 md:text-base"
                            >
                                <FaPlay className="text-xs" />
                                Jay Swaminarayan
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="w-screen overflow-x-hidden bg-white scrollbar-hide">
                <div className="fixed left-0 top-4 z-[9999] flex -translate-x-[13.8rem] flex-col items-center gap-3 rounded-r-2xl bg-white py-2 pl-4 pr-5 shadow-2xl ring-1 ring-red-100 transition-transform duration-300 hover:translate-x-0 md:top-6">
                    <ElasticSlider
                        defaultValue={volume}
                        startingValue={0}
                        maxValue={100}
                        isStepped
                        stepSize={5}
                        leftIcon={<FaVolumeDown className="text-xs" />}
                        rightIcon={<FaVolumeUp className="text-xs" />}
                        onChange={setVolume}
                        className="w-36"
                    />

                    <button
                        type="button"
                        onClick={toggleMusic}
                        className="flex h-10 min-w-16 items-center justify-center rounded-full bg-red-800 px-4 text-sm font-bold text-white shadow-md transition-all hover:bg-red-700 active:scale-95"
                    >
                        {isMusicPlaying ? "Stop" : "Start"}
                    </button>
                </div>

                <AnimatePresence>
                    {logoDocked && (
                        <motion.div
                            layoutId="gurukul-main-logo"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 180, damping: 24 }}
                            className="fixed right-32 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-red-100 bg-white p-2 shadow-2xl md:right-40 md:top-6 md:h-12 md:w-12"
                        >
                            <img
                                src={resolvedLogoImg}
                                alt="Gurukul Logo"
                                className="h-full w-full object-contain"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <Link
                    to="/login"
                    className="group fixed right-4 top-4 z-50 flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 font-bold text-red-800 shadow-2xl ring-1 ring-red-100 transition-all hover:scale-105 hover:bg-red-50 active:scale-95 md:right-8 md:top-6 md:h-12 md:px-6"
                >
                    <span className="text-sm md:text-base">Login</span>
                    <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1 md:text-sm" />
                </Link>

                <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-red-950">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={heroIndex}
                            src={heroImages[heroIndex]}
                            alt="Gurukul Hero Background"
                            initial={{ opacity: 0, scale: 1.06 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.03 }}
                            transition={{ duration: 1.15, ease: "easeInOut" }}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-linear-to-b from-red-950/55 via-red-900/10 to-red-950/75" />

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white"
                    >
                    </motion.div>

                    <button
                        type="button"
                        onClick={goToPrevHero}
                        className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-red-800 shadow-2xl ring-1 ring-red-100 transition-all hover:scale-105 hover:bg-white active:scale-95 md:left-8 md:h-12 md:w-12"
                        aria-label="Previous image"
                    >
                        <FaChevronLeft />
                    </button>

                    <button
                        type="button"
                        onClick={goToNextHero}
                        className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-red-800 shadow-2xl ring-1 ring-red-100 transition-all hover:scale-105 hover:bg-white active:scale-95 md:right-8 md:h-12 md:w-12"
                        aria-label="Next image"
                    >
                        <FaChevronRight />
                    </button>
                </section>

                <section className="relative min-h-screen w-full overflow-hidden px-5 py-16 md:px-8 md:py-24">
                    <AnimatedSectionBackground />

                    <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.35 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-[2.25rem] border-[3px] border-red-200 bg-linear-to-tl from-red-800 to-red-600 shadow-2xl md:h-44 md:w-44 md:rounded-[3rem]">
                                <GiPagoda className="text-5xl text-white md:text-6xl" />
                                <p className="text-base font-bold uppercase tracking-widest text-white md:text-xl">
                                    Gurukul
                                </p>
                            </div>

                            <h2 className="mt-8 text-5xl font-black tracking-tight text-red-800 md:text-7xl">
                                GURUKUL
                            </h2>

                            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-red-700 md:text-xl md:leading-8">
                              VIDYA, SADVIDYA, ANE BRAHMVIDYA NO ANOKHO SANGAM.
                            </p>
                        </motion.div>

                        <div className="mt-16 flex w-full flex-col items-center gap-6 lg:flex-row">
                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.25 }}
                                className="h-72 w-full rounded-[2.5rem] bg-red-800 p-4 shadow-2xl md:h-112 md:p-6 lg:w-[62%]"
                            >
                                <div className="h-full w-full overflow-hidden rounded-[1.75rem] border border-red-950/20 bg-white shadow-inner">
                                    <img
                                        src={resolvedCampusImg}
                                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                        alt="Bhayavadar Gurukul Overview"
                                    />
                                </div>
                            </motion.div>

                            <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-[38%] lg:flex-col">
                                {campusGalleryImages.slice(0, 2).map((src, index) => (
                                    <motion.div
                                        key={`${src}-${index}`}
                                        variants={fadeUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.25 }}
                                        className="h-52 w-full rounded-4xl bg-red-800 p-4 shadow-2xl md:h-54"
                                    >
                                        <div className="h-full w-full overflow-hidden rounded-[1.25rem] border border-red-950/20 bg-white shadow-inner">
                                            <img
                                                src={src}
                                                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                                alt={`Gurukul Gallery ${index + 1}`}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {(overviewConfig?.showStackSection ?? true) && (
                    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-20 md:px-8">
                        <AnimatedSectionBackground />

                        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.35 }}
                                className="text-center text-red-800 lg:text-left"
                            >
                                <p className="text-sm font-bold uppercase tracking-[0.35em] text-red-700">
                                    Gurukul Gallery
                                </p>

                                <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                                    {overviewConfig?.stackTitle || "Memories in Motion"}
                                </h2>

                                <p className="mx-auto mt-5 max-w-xl text-base font-semibold leading-8 text-red-700/80 md:text-lg lg:mx-0">
                                    {overviewConfig?.stackSubtitle || "Drag karo, click karo, athva wait karo."}
                                </p>
                            </motion.div>

                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.35 }}
                                className="mx-auto h-76 w-76 md:h-108 md:w-108"
                            >
                                <Stack
                                    randomRotation
                                    sensitivity={160}
                                    sendToBackOnClick
                                    autoplay
                                    autoplayDelay={4200}
                                    pauseOnHover
                                    mobileClickOnly
                                    cards={stackCards}
                                    animationConfig={{ stiffness: 180, damping: 26 }}
                                />
                            </motion.div>
                        </div>
                    </section>
                )}

                {(overviewConfig?.showChromaSection ?? true) && (
                    <section className="relative min-h-screen w-full overflow-hidden px-5 py-20 md:px-8 scrollbar-hide">
                        <AnimatedSectionBackground />

                        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center">
                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.35 }}
                                className="text-center"
                            >
                                <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-700 md:text-sm">
                                    Chroma Stories
                                </p>
                                <h2 className="mt-3 text-4xl font-black tracking-tight text-red-800 md:text-6xl">
                                    {overviewConfig?.chromaTitle || "Gurukul Highlights"}
                                </h2>
                                <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-8 text-red-700/80 md:text-lg">
                                    {overviewConfig?.chromaSubtitle ||
                                        "Move cursor over cards to reveal color spotlight."}
                                </p>
                            </motion.div>

                            <motion.div
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                className="mt-14 h-350 w-full rounded-4xl md:h-auto"
                            >
                                <ChromaGrid
                                    items={chromaItems}
                                    radius={300}
                                    damping={0.7}
                                    fadeOut={0.8}
                                    ease="power3.out"
                                />
                            </motion.div>
                        </div>
                    </section>
                )}
            </main>
        </>
    );
}