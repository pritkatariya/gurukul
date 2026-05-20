import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Router from "./Routes/Route";
import { MusicProvider } from "./Components/MusicProvider";
import { Toaster } from "sonner";

function App() {
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
            </BrowserRouter>
        </MusicProvider>
    );
}

export default App;