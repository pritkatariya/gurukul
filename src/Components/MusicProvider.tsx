import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

import BackgroundSong from "../assets/jay-swaminarayan.mp3";

type MusicContextType = {
    isMusicPlaying: boolean;
    toggleMusic: () => void;
    playMusic: () => void;
    stopMusic: () => void;
    volume: number;
    setVolume: (value: number) => void;
};

const MusicContext = createContext<MusicContextType | null>(null);

const MUSIC_TIME_KEY = "gurukul_music_time";
const MUSIC_VOLUME_KEY = "gurukul_music_volume";
const MUSIC_PLAYING_KEY = "gurukul_music_playing";

export function MusicProvider({ children }: { children: ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);

    const [volume, setVolumeState] = useState<number>(() => {
        const savedVolume = Number(localStorage.getItem(MUSIC_VOLUME_KEY) || "55");
        return Number.isFinite(savedVolume) ? savedVolume : 55;
    });

    useEffect(() => {
        const audio = new Audio(BackgroundSong);
        audio.loop = true;
        audio.volume = volume / 100;
        audioRef.current = audio;

        // 🎯 જાદુઈ કોડ: જ્યારે પણ સર્ચ બારમાંથી નવું ગીત સિલેક્ટ થાય ત્યારે ઓડિયો સોર્સ બદલવા માટે
        const handleTrackChange = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            const newAudioUrl = customEvent.detail;
            if (newAudioUrl && audioRef.current) {
                const wasPlaying = !audioRef.current.paused;
                audioRef.current.src = newAudioUrl;
                audioRef.current.load();
                if (wasPlaying || localStorage.getItem(MUSIC_PLAYING_KEY) === "true") {
                    audioRef.current.play().catch(err => console.log("Playback error:", err));
                }
            }
        };
        window.addEventListener("change-gurukul-track", handleTrackChange);

        const savedTime = Number(localStorage.getItem(MUSIC_TIME_KEY) || "0");
        const shouldPlay = localStorage.getItem(MUSIC_PLAYING_KEY) === "true";

        if (Number.isFinite(savedTime) && savedTime > 0) {
            audio.currentTime = savedTime;
        }

        const saveProgress = () => {
            localStorage.setItem(MUSIC_TIME_KEY, String(audio.currentTime));
        };

        const tryResume = () => {
            if (!shouldPlay) return;

            audio.play()
                .then(() => {
                    setIsMusicPlaying(true);
                    localStorage.setItem(MUSIC_PLAYING_KEY, "true");
                    window.removeEventListener("click", tryResume);
                    window.removeEventListener("touchstart", tryResume);
                })
                .catch(() => {
                    setIsMusicPlaying(false);
                });
        };

        const handlePlay = () => setIsMusicPlaying(true);
        const handlePause = () => setIsMusicPlaying(false);

        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);

        const interval = window.setInterval(saveProgress, 1000);

        window.addEventListener("beforeunload", saveProgress);
        window.addEventListener("click", tryResume);
        window.addEventListener("touchstart", tryResume);

        tryResume();

        return () => {
            saveProgress();
            clearInterval(interval);
            audio.pause();
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            // ક્લીનઅપ લિસનર
            window.removeEventListener("change-gurukul-track", handleTrackChange);
            window.removeEventListener("beforeunload", saveProgress);
            window.removeEventListener("click", tryResume);
            window.removeEventListener("touchstart", tryResume);
        };
    }, []);

    const setVolume = (value: number) => {
        const nextVolume = Math.min(Math.max(value, 0), 100);

        setVolumeState(nextVolume);
        localStorage.setItem(MUSIC_VOLUME_KEY, String(nextVolume));

        if (audioRef.current) {
            audioRef.current.volume = nextVolume / 100;
        }
    };

    const playMusic = () => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.play()
            .then(() => {
                setIsMusicPlaying(true);
                localStorage.setItem(MUSIC_PLAYING_KEY, "true");
            })
            .catch((error) => {
                console.log("Audio play failed:", error);
                setIsMusicPlaying(false);
                localStorage.setItem(MUSIC_PLAYING_KEY, "false");
            });
    };

    const stopMusic = () => {
        const audio = audioRef.current;
        if (!audio) return;

        localStorage.setItem(MUSIC_TIME_KEY, String(audio.currentTime));
        localStorage.setItem(MUSIC_PLAYING_KEY, "false");
        audio.pause();
        setIsMusicPlaying(false);
    };

    const toggleMusic = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            playMusic();
        } else {
            stopMusic();
        }
    };

    return (
        <MusicContext.Provider
            value={{
                isMusicPlaying,
                toggleMusic,
                playMusic,
                stopMusic,
                volume,
                setVolume,
            }}
        >
            {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
    const context = useContext(MusicContext);

    if (!context) {
        throw new Error("useMusic must be used inside MusicProvider");
    }

    return context;
}