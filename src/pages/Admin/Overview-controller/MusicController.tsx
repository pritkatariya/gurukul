import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FaMusic, FaTrash, FaPlus } from "react-icons/fa";
import Button from "../../../Components/commen/Button";

interface Song {
    id: number;
    title: string;
    artist: string;
    audio_url: string;
}

export default function MusicController() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);

    // 🎯 ફિક્સ પાથ: /music/songs
    const fetchSongs = async () => {
        try {
            const res = await fetch(`${API_URL}/music/songs`);
            const data = await res.json();
            if (data.success) {
                setSongs(data.songs);
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
            toast.error("Failed to load music tracks");
        }
    };

    useEffect(() => {
        fetchSongs();
    }, []);

    const handleAddSong = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !audioFile) {
            toast.error("Please provide a song title and select an MP3 file");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("artist", artist.trim() || "Gurukul Sevak");
        formData.append("audio", audioFile); // મલ્ટર માટે ફાઈલ કી 'audio'

        try {
            // 🎯 ફિક્સ પાથ: /music/upload
            const response = await fetch(`${API_URL}/music/upload`, {
                method: "POST",
                body: formData, 
            });

            // જો રિસ્પોન્સમાં HTML પાછું આવે તો એપ્લિકેશન ક્રેશ ન થાય તે માટે સેફ્ટી ચેક
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const textError = await response.text();
                console.error("Server HTML Response Error:", textError);
                throw new Error("Server sent unexpected HTML. Check backend console!");
            }

            const data = await response.json();

            if (data.success) {
                toast.success(data.message || "Song uploaded successfully! 🎵");
                setTitle("");
                setArtist("");
                setAudioFile(null);
                const fileInput = document.getElementById("audio-input") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
                
                fetchSongs(); // લિસ્ટ રીફ્રેશ કરો
            } else {
                toast.error(data.message || "Failed to upload song");
            }
        } catch (error) {
            console.error("Upload error detail:", error);
            toast.error(error instanceof Error ? error.message : "Server connection error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteSong = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this track?")) return;

        try {
            // 🎯 ફિક્સ પાથ: /music/songs/:id
            const res = await fetch(`${API_URL}/music/songs/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Track removed successfully!");
                setSongs(songs.filter((song) => song.id !== id));
            } else {
                toast.error(data.message || "Could not delete track");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Server error while deleting");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-8 font-sans">
            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                {/* હેડર સેક્શન */}
                <div className="overflow-hidden rounded-4xl border border-slate-100 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="grid h-14 w-14 place-items-center rounded-3xl bg-red-50 text-red-800 shadow-inner">
                                <FaMusic className="text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                    Gurukul Music Library
                                </h1>
                                <p className="text-sm font-medium text-slate-500 mt-1">
                                    Manage devotional audio tracks with a polished upload and preview experience.
                                </p>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
                            Track count: <span className="text-slate-900">{songs.length}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* ડાબી બાજુ: ન્યુ ટ્રેક ફોર્મ */}
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/30">
                    <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <FaPlus className="text-red-700 text-base" /> Add New Track
                    </h2>
                    <form onSubmit={handleAddSong} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="title" className="text-[11px] font-black uppercase tracking-wider text-slate-400">Song Title / Naam</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Jay Swaminarayan Mara Vhala"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all duration-300 focus:border-red-800 focus:ring-4 focus:ring-red-800/10"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="artist" className="text-[11px] font-black uppercase tracking-wider text-slate-400">Artist / Singer</label>
                            <input
                                id="artist"
                                type="text"
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                placeholder="e.g., Gurukul Santos (Optional)"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all duration-300 focus:border-red-800 focus:ring-4 focus:ring-red-800/10"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="audio-input" className="text-[11px] font-black uppercase tracking-wider text-slate-400">Select Audio File (.mp3)</label>
                            <input
                                id="audio-input"
                                type="file"
                                accept="audio/mp3, audio/*"
                                onChange={(e) => {
                                    if (e.target.files) setAudioFile(e.target.files[0]);
                                }}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:uppercase file:bg-red-50 file:text-red-800 file:cursor-pointer"
                                required
                            />
                            {audioFile ? (
                                <p className="text-[11px] text-slate-500">Selected file: {audioFile.name}</p>
                            ) : null}
                        </div>

                        <Button 
                            type="submit"
                            isLoading={isUploading}
                            text="Upload Track to DB"
                            loadingText="Uploading Track..."
                        />
                    </form>
                </div>

                {/* જમણી બાજુ: ટેબલ લિસ્ટ */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/30">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-700">Active Database Tracks</h2>
                            <p className="text-xs text-slate-500 mt-1">Play or remove devotional audio files from the library.</p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-600">
                            Total: {songs.length}
                        </span>
                    </div>

                    <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-slate-50/80 p-2">
                        <table className="min-w-full table-auto text-left">
                            <thead>
                                <tr className="bg-slate-100 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                                    <th className="py-3 px-4">Title / Naam</th>
                                    <th className="py-3 px-4">Artist</th>
                                    <th className="py-3 px-4">Player Preview</th>
                                    <th className="py-3 px-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-sm text-slate-600">
                                {songs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center text-slate-400">
                                            No tracks available in database.
                                        </td>
                                    </tr>
                                ) : (
                                    songs.map((song) => (
                                        <tr key={song.id} className="transition-colors hover:bg-white">
                                            <td className="py-4 px-4 font-semibold text-slate-800">{song.title}</td>
                                            <td className="py-4 px-4 text-slate-500">{song.artist}</td>
                                            <td className="py-4 px-4">
                                                <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                                                    <audio controls src={song.audio_url} className="w-full max-w-[320px] outline-none" />
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteSong(song.id)}
                                                    className="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                    title="Delete Track"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}