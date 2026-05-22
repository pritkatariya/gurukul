import { useEffect, useState } from 'react';
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Router from "./Routes/Route";
import { MusicProvider } from "./Components/MusicProvider";
import { Toaster } from "sonner";

function App() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        }
    };

    return (
        <MusicProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    expand={false}
                    toastOptions={{
                        style: {
                            background: "#fff",
                            boxShadow: "inset 0 3px 5px #000000",
                            border: "1px solid red",
                            borderRadius: "1rem",
                            marginTop: "10px",
                            padding: "16px",
                            fontSize: "15px",
                            color: "#840000",
                            fontWeight: "600",
                        },
                        className: "my-custom-toast",
                    }}
                />

                <Router />

                {/* ઇન્સ્ટોલ બટન - ફક્ત ત્યારે જ દેખાશે જ્યારે બ્રાઉઝર સપોર્ટ કરશે */}
                {deferredPrompt && (
                    <button 
                        onClick={handleInstall} 
                        style={{ 
                            position: 'fixed', bottom: '20px', left: '20px', 
                            zIndex: 9999, padding: '10px 20px', backgroundColor: '#840000', 
                            color: 'white', borderRadius: '10px', cursor: 'pointer',
                            border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                        }}
                    >
                        Install App
                    </button>
                )}
            </BrowserRouter>
        </MusicProvider>
    );
}

export default App;