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
        <div className="w-full flex flex-col gap-6 p-6 bg-slate-50/50 min-h-screen font-sans">
            {/* હેડર સેક્શન */}
            <div className="w-full flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-800 rounded-xl shadow-inner">
                        <FaMusic className="text-xl" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">
                            Gurukul Music Library
                        </h1>
                        <p className="text-slate-400 text-xs font-medium mt-0.5">Manage background devotional audio tracks database.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* ડાબી બાજુ: ન્યુ ટ્રેક ફોર્મ */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
                    <h2 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2 border-b border-slate-50 pb-3">
                        <FaPlus className="text-red-700 text-xs" /> Add New Track
                    </h2>
                    <form onSubmit={handleAddSong} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Song Title / Naam</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Jay Swaminarayan Mara Vhala"
                                className="w-full p-3 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-red-800 focus:ring-4 focus:ring-red-800/5 transition-all duration-300"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Artist / Singer</label>
                            <input
                                type="text"
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                placeholder="e.g., Gurukul Santos (Optional)"
                                className="w-full p-3 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-red-800 focus:ring-4 focus:ring-red-800/5 transition-all duration-300"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">Select Audio File (.mp3)</label>
                            <input
                                id="audio-input"
                                type="file"
                                accept="audio/mp3, audio/*"
                                onChange={(e) => {
                                    if (e.target.files) setAudioFile(e.target.files[0]);
                                }}
                                className="w-full p-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-red-50 file:text-red-800 file:cursor-pointer"
                                required
                            />
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
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80">
                    <div className="flex justify-between items-center mb-5 border-b border-slate-50 pb-3">
                        <h2 className="text-sm font-bold text-slate-700">Active Database Tracks</h2>
                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                            Total: {songs.length}
                        </span>
                    </div>
                    
                    <div className="w-full overflow-x-auto rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                                    <th className="py-3 px-4">Title / Naam</th>
                                    <th className="py-3 px-4">Artist</th>
                                    <th className="py-3 px-4">Player Preview</th>
                                    <th className="py-3 px-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60 text-xs text-slate-600 font-medium">
                                {songs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-slate-400">
                                            No tracks available in database.
                                        </td>
                                    </tr>
                                ) : (
                                    songs.map((song) => (
                                        <tr key={song.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-bold text-slate-700">{song.title}</td>
                                            <td className="py-4 px-4 text-slate-400">{song.artist}</td>
                                            <td className="py-4 px-4">
                                                <div className="bg-slate-50/80 p-1.5 rounded-xl w-fit border border-slate-100">
                                                    <audio controls src={song.audio_url} className="h-7 max-w-52.5 outline-none" />
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteSong(song.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete Track"
                                                >
                                                    <FaTrash className="text-xs" />
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
    );
}