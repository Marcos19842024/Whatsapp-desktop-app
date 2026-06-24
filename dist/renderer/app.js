"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_1 = require("react-dom/client");
const styles_1 = require("@mui/material/styles");
const CssBaseline_1 = __importDefault(require("@mui/material/CssBaseline"));
const react_toastify_1 = require("react-toastify");
// @ts-ignore: no type declarations for CSS import
require("react-toastify/dist/ReactToastify.css");
require("./styles.css");
const Dashboard_1 = __importDefault(require("../components/Dashboard"));
// Tema personalizado
const theme = (0, styles_1.createTheme)({
    palette: {
        mode: 'light',
        primary: {
            main: '#25D366', // WhatsApp green
            dark: '#128C7E',
            light: '#DCF8C6',
        },
        secondary: {
            main: '#075E54',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                },
            },
        },
    },
});
const App = () => {
    const [isReady, setIsReady] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Configurar listeners de electron
        if (window.electronAPI) {
            window.electronAPI.on('app-error', (message) => {
                react_toastify_1.toast.error(message);
            });
            setIsReady(true);
        }
    }, []);
    if (!isReady) {
        return (0, jsx_runtime_1.jsx)("div", { children: "Cargando aplicaci\u00F3n..." });
    }
    return ((0, jsx_runtime_1.jsxs)(styles_1.ThemeProvider, { theme: theme, children: [(0, jsx_runtime_1.jsx)(CssBaseline_1.default, {}), (0, jsx_runtime_1.jsx)(Dashboard_1.default, {}), (0, jsx_runtime_1.jsx)(react_toastify_1.ToastContainer, { position: "bottom-right", autoClose: 5000, hideProgressBar: false, newestOnTop: true, closeOnClick: true, rtl: false, pauseOnFocusLoss: true, draggable: true, pauseOnHover: true, theme: "light" })] }));
};
const container = document.getElementById('root');
const root = (0, client_1.createRoot)(container);
root.render((0, jsx_runtime_1.jsx)(App, {}));
//# sourceMappingURL=app.js.map