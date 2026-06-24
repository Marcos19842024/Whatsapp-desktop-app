"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_toastify_1 = require("react-toastify");
const Settings = () => {
    const [config, setConfig] = (0, react_1.useState)({
        nombreClinica: '',
        apiUrl: '',
        phoneNumberId: '',
        accessToken: '',
        waitBetween: 2000,
        maxRetries: 3
    });
    const [showToken, setShowToken] = (0, react_1.useState)(false);
    const [showPhoneId, setShowPhoneId] = (0, react_1.useState)(false);
    const [saved, setSaved] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Cargar configuración
        if (window.electronAPI) {
            window.electronAPI.on('config-loaded', (data) => {
                setConfig(data);
            });
            window.electronAPI.send('get-config');
        }
    }, []);
    const handleSave = () => {
        if (window.electronAPI) {
            window.electronAPI.send('save-config', config);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            react_toastify_1.toast.success('Configuración guardada correctamente');
        }
    };
    const handleRefresh = () => {
        if (window.electronAPI) {
            window.electronAPI.send('get-config');
            react_toastify_1.toast.info('Configuración recargada');
        }
    };
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "Configuraci\u00F3n del Sistema" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: handleRefresh, title: "Recargar configuraci\u00F3n", children: (0, jsx_runtime_1.jsx)(icons_material_1.Refresh, {}) }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "primary", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Save, {}), onClick: handleSave, children: "Guardar Configuraci\u00F3n" })] })] }), saved && ((0, jsx_runtime_1.jsx)(material_1.Alert, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.CheckCircle, {}), severity: "success", sx: { mb: 3 }, children: "Configuraci\u00F3n guardada exitosamente" })), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 6, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "Nombre de la Cl\u00EDnica", value: config.nombreClinica, onChange: (e) => setConfig({ ...config, nombreClinica: e.target.value }), helperText: "Este nombre aparecer\u00E1 en los mensajes", sx: { mb: 2 } }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "URL de la API de WhatsApp", value: config.apiUrl, onChange: (e) => setConfig({ ...config, apiUrl: e.target.value }), helperText: "URL de la API de WhatsApp Business", sx: { mb: 2 } }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "ID del N\u00FAmero de Tel\u00E9fono", value: config.phoneNumberId, onChange: (e) => setConfig({ ...config, phoneNumberId: e.target.value }), type: showPhoneId ? 'text' : 'password', helperText: "ID del n\u00FAmero de tel\u00E9fono de WhatsApp Business", InputProps: {
                                        endAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "end", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => setShowPhoneId(!showPhoneId), children: showPhoneId ? (0, jsx_runtime_1.jsx)(icons_material_1.VisibilityOff, {}) : (0, jsx_runtime_1.jsx)(icons_material_1.Visibility, {}) }) }))
                                    }, sx: { mb: 2 } })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 6, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "Token de Acceso", value: config.accessToken, onChange: (e) => setConfig({ ...config, accessToken: e.target.value }), type: showToken ? 'text' : 'password', helperText: "Token de acceso de la API de WhatsApp", InputProps: {
                                        endAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "end", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => setShowToken(!showToken), children: showToken ? (0, jsx_runtime_1.jsx)(icons_material_1.VisibilityOff, {}) : (0, jsx_runtime_1.jsx)(icons_material_1.Visibility, {}) }) }))
                                    }, sx: { mb: 2 } }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "Espera entre mensajes (ms)", value: config.waitBetween, onChange: (e) => setConfig({ ...config, waitBetween: parseInt(e.target.value) || 2000 }), type: "number", helperText: "Tiempo de espera entre el env\u00EDo de cada mensaje", sx: { mb: 2 } }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "Intentos m\u00E1ximos", value: config.maxRetries, onChange: (e) => setConfig({ ...config, maxRetries: parseInt(e.target.value) || 3 }), type: "number", helperText: "N\u00FAmero m\u00E1ximo de reintentos en caso de fallo", sx: { mb: 2 } })] })] }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { my: 3 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "Configuraci\u00F3n Avanzada" }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle2", gutterBottom: true, children: "WhatsApp Business API" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "Aseg\u00FArate de que tu token tenga los permisos necesarios para enviar mensajes. La API requiere autenticaci\u00F3n con token de acceso." })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle2", gutterBottom: true, children: "Plantillas de Mensajes" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "Las plantillas deben estar aprobadas en el Meta Business Suite antes de ser utilizadas. Las plantillas disponibles: citas, vacunas, y personalizadas." })] }) }) })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { mt: 3, display: 'flex', justifyContent: 'flex-end' }, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "primary", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Save, {}), onClick: handleSave, size: "large", children: "Guardar Configuraci\u00F3n" }) })] }) }));
};
exports.default = Settings;
//# sourceMappingURL=Settings.js.map