import { BrowserRouter } from 'react-router-dom'
import './App.css'
import Router from './Routes/Route'
import { Toaster } from 'sonner'

function App() {
    return (
        <BrowserRouter>
            {/* કસ્ટમ સ્ટાઇલ અને કલર્સ સેટ કરવા માટેનો સાચો TypeScript ફ્રેન્ડલી રસ્તો */}
            <Toaster
                position="top-right"
                expand={false}
                toastOptions={{
                    style: {
                        background: '#fff',
                        boxShadow: 'inset 0 3px 5px #000000',
                        border: '1px solid red',
                        borderRadius: '1rem',
                        marginTop: "10px",
                        padding: '16px',
                        fontSize: '15px',
                        color: "#840000",
                        fontWeight: '600',
                    },
                    className: 'my-custom-toast',
                }}
            />
            <Router />
        </BrowserRouter>
    )
}

export default App