"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_dropzone_1 = require("react-dropzone");
const react_toastify_1 = require("react-toastify");
const ClientsList_1 = __importDefault(require("./ClientsList"));
const MessagePreview_1 = __importDefault(require("./MessagePreview"));
const Settings_1 = __importDefault(require("./Settings"));
const LogsViewer_1 = __importDefault(require("./LogsViewer"));
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `tabpanel-${index}`, "aria-labelledby": `tab-${index}`, ...other, children: value === index && (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { p: 3 }, children: children }) }));
}
const Dashboard = () => {
    const [tabValue, setTabValue] = (0, react_1.useState)(0);
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    const [progress, setProgress] = (0, react_1.useState)(0);
    const [progressMessage, setProgressMessage] = (0, react_1.useState)('');
    const [clients, setClients] = (0, react_1.useState)([]);
    const [selectedClient, setSelectedClient] = (0, react_1.useState)(null);
    const [isImporting, setIsImporting] = (0, react_1.useState)(false);
    const [uploadedFile, setUploadedFile] = (0, react_1.useState)(null);
    const [stats, setStats] = (0, react_1.useState)({
        total: 0,
        enviados: 0,
        fallidos: 0,
        pendientes: 0
    });
    const [snackbar, setSnackbar] = (0, react_1.useState)({
        open: false,
        message: '',
        severity: 'info'
    });
    // Dropzone para Excel
    const { getRootProps, getInputProps, isDragActive } = (0, react_dropzone_1.useDropzone)({
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        onDrop: async (files) => {
            console.log('📄 Archivo soltado en Dropzone:', files);
            if (files.length > 0) {
                const file = files[0];
                console.log('📄 Archivo:', file.name, 'Tamaño:', file.size);
                if (window.electronAPI) {
                    setIsImporting(true);
                    react_toastify_1.toast.info(`📂 Procesando archivo: ${file.name}`);
                    // TIMEOUT: Si pasa más de 30 segundos, mostrar error
                    const timeoutId = setTimeout(() => {
                        if (isImporting) {
                            setIsImporting(false);
                            react_toastify_1.toast.error('⏱️ El procesamiento está tomando demasiado tiempo');
                        }
                    }, 30000);
                    try {
                        // Leer el archivo como ArrayBuffer
                        const arrayBuffer = await file.arrayBuffer();
                        // Convertir a base64
                        const uint8Array = new Uint8Array(arrayBuffer);
                        let binary = '';
                        for (let i = 0; i < uint8Array.length; i++) {
                            binary += String.fromCharCode(uint8Array[i]);
                        }
                        const base64 = btoa(binary);
                        console.log('📤 Enviando archivo al main process...');
                        console.log('📊 Tamaño base64:', base64.length);
                        // Enviar al proceso principal
                        window.electronAPI.send('import-excel-data', {
                            fileName: file.name,
                            fileData: base64
                        });
                        // Limpiar timeout
                        clearTimeout(timeoutId);
                    }
                    catch (error) {
                        console.error('❌ Error al leer el archivo:', error);
                        react_toastify_1.toast.error('Error al leer el archivo');
                        setIsImporting(false);
                        // Limpiar timeout
                        clearTimeout(timeoutId);
                    }
                }
                else {
                    console.error('❌ electronAPI no disponible');
                    react_toastify_1.toast.error('API no disponible');
                }
            }
        }
    });
    // Escuchar el evento import-complete
    (0, react_1.useEffect)(() => {
        console.log('🔍 Dashboard mounted');
        console.log('📡 window.electronAPI disponible:', !!window.electronAPI);
        if (!window.electronAPI) {
            console.error('❌ electronAPI NO disponible');
            return;
        }
        // Registrar listener para import-complete
        window.electronAPI.on('import-complete', (data) => {
            console.log('🎉 ===== import-complete RECIBIDO =====');
            console.log('📊 Datos:', {
                fileName: data.fileName,
                tipo: data.tipo,
                total: data.total,
                primerCliente: data.clientes?.[0]
            });
            if (!data || !data.clientes) {
                console.error('❌ Datos inválidos');
                react_toastify_1.toast.error('Datos inválidos recibidos');
                return;
            }
            // Actualizar el estado
            setUploadedFile(data.fileName);
            setClients(data.clientes);
            setStats({
                total: data.clientes.length,
                enviados: 0,
                fallidos: 0,
                pendientes: data.clientes.length
            });
            setIsImporting(false);
            // Mostrar mensaje de éxito con detalles
            const tipoTexto = data.tipo === 'vacunas' ? 'Vacunas' : 'Citas';
            react_toastify_1.toast.success(`✅ ${data.clientes.length} clientes de ${tipoTexto} importados de ${data.fileName}`);
            console.log('✅ Estado actualizado correctamente');
        });
        // Registrar listener para errores
        window.electronAPI.on('app-error', (message) => {
            console.log('❌ app-error recibido:', message);
            setIsImporting(false);
            react_toastify_1.toast.error(message);
        });
        // Solicitar configuración
        console.log('📤 Solicitando configuración...');
        window.electronAPI.send('get-config');
    }, []);
    // Cargar datos iniciales
    (0, react_1.useEffect)(() => {
        if (window.electronAPI) {
            // Escuchar eventos del main
            window.electronAPI.on('import-complete', (data) => {
                setClients(data.clientes);
                setStats(prev => ({
                    ...prev,
                    total: data.clientes.length,
                    pendientes: data.clientes.length
                }));
                react_toastify_1.toast.success(`Archivo ${data.fileName} importado correctamente`);
            });
            window.electronAPI.on('send-progress', (data) => {
                setIsProcessing(true);
                setProgress(data.progress || 0);
                setProgressMessage(data.message || 'Procesando...');
            });
            window.electronAPI.on('send-complete', (data) => {
                setIsProcessing(false);
                setProgress(100);
                setStats(prev => ({
                    ...prev,
                    enviados: data.enviados,
                    fallidos: data.fallidos,
                    pendientes: data.total - data.enviados
                }));
                react_toastify_1.toast.success(`Envío completado: ${data.enviados} enviados, ${data.fallidos} fallidos`);
            });
            // Menú actions
            window.electronAPI.on('menu-import-excel', () => {
                // Simular click en el dropzone
                const fileInput = document.querySelector('input[type="file"]');
                fileInput?.click();
            });
            window.electronAPI.on('menu-send-citas', () => {
                handleSendCitas();
            });
            window.electronAPI.on('menu-send-vacunas', () => {
                handleSendVacunas();
            });
        }
        return () => {
            // Limpiar listeners
        };
    }, []);
    const handleSendCitas = async () => {
        if (window.electronAPI) {
            window.electronAPI.send('send-citas', {
                excelPath: process.env.EXCEL_AGENDAS_PATH
            });
        }
    };
    const handleSendVacunas = async () => {
        if (window.electronAPI) {
            window.electronAPI.send('send-vacunas', {
                excelPath: process.env.EXCEL_MP_PATH
            });
        }
    };
    const handleRefresh = () => {
        if (window.electronAPI) {
            window.electronAPI.send('get-logs');
        }
        react_toastify_1.toast.info('Actualizando...');
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', height: '100vh', overflow: 'hidden' }, children: [(0, jsx_runtime_1.jsx)(material_1.AppBar, { position: "fixed", sx: { zIndex: (theme) => theme.zIndex.drawer + 1 }, children: (0, jsx_runtime_1.jsxs)(material_1.Toolbar, { children: [(0, jsx_runtime_1.jsx)(icons_material_1.WhatsApp, { sx: { mr: 2 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", noWrap: true, component: "div", sx: { flexGrow: 1 }, children: "WhatsApp Reminder System" }), (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "Actualizar", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "inherit", onClick: handleRefresh, children: (0, jsx_runtime_1.jsx)(icons_material_1.Refresh, {}) }) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Box, { component: "main", sx: {
                    flexGrow: 1,
                    pt: 8,
                    height: '100vh',
                    overflow: 'auto',
                    bgcolor: 'background.default'
                }, children: (0, jsx_runtime_1.jsxs)(material_1.Container, { maxWidth: "xl", sx: { py: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3, mb: 3 }, ...getRootProps(), children: [(0, jsx_runtime_1.jsx)("input", { ...getInputProps() }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.CloudUpload, { sx: { fontSize: 48, color: '#25D366', mb: 2 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: isDragActive ? 'Suelta el archivo aquí' : 'Arrastra o haz clic para importar Excel' }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "Soporta archivos .xlsx y .xls" }), isImporting && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 24 }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: "Cargando archivo..." })] })), uploadedFile && !isImporting && ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: `Archivo: ${uploadedFile}`, color: "success", sx: { mt: 2 } }))] })] }), isProcessing && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.LinearProgress, { variant: "determinate", value: progress }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", sx: { mt: 1 }, children: progressMessage })] })), (0, jsx_runtime_1.jsxs)(material_1.Tabs, { value: tabValue, onChange: (e, v) => setTabValue(v), sx: { mb: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Tab, { label: "Dashboard", icon: (0, jsx_runtime_1.jsx)(icons_material_1.Dashboard, {}) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: `Clientes (${stats.total})`, icon: (0, jsx_runtime_1.jsx)(icons_material_1.People, {}) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "Mensajes", icon: (0, jsx_runtime_1.jsx)(icons_material_1.Message, {}) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "Logs", icon: (0, jsx_runtime_1.jsx)(icons_material_1.History, {}) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "Configuraci\u00F3n", icon: (0, jsx_runtime_1.jsx)(icons_material_1.Settings, {}) })] }), (0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 0, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "Acciones R\u00E1pidas" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "primary", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Science, {}), onClick: () => window.electronAPI?.send('simulate-citas', {}), disabled: isProcessing, fullWidth: true, children: "\uD83D\uDD2C Enviar Recordatorios de Citas (prueba)" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "secondary", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Science, {}), onClick: () => window.electronAPI?.send('simulate-vacunas', {}), disabled: isProcessing, fullWidth: true, children: "\uD83D\uDD2C Enviar Recordatorios de Vacunas (prueba)" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "primary", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Send, {}), onClick: handleSendCitas, disabled: isProcessing, fullWidth: true, children: "Enviar Recordatorios de Citas" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "secondary", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Send, {}), onClick: handleSendVacunas, disabled: isProcessing, fullWidth: true, children: "Enviar Recordatorios de Vacunas" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Download, {}), onClick: () => {
                                                                if (window.electronAPI) {
                                                                    window.electronAPI.send('export-report', { clientes: clients });
                                                                }
                                                            }, disabled: clients.length === 0, fullWidth: true, children: "Exportar Reporte" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "Resumen de Env\u00EDos" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-around', py: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { textAlign: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", color: "success.main", children: stats.enviados }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: "Enviados" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { textAlign: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", color: "error.main", children: stats.fallidos }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: "Fallidos" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { textAlign: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", color: "warning.main", children: stats.pendientes }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: "Pendientes" })] })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u00DAltimos Clientes Procesados" }), (0, jsx_runtime_1.jsx)(ClientsList_1.default, { clients: clients.slice(0, 10), onSelect: setSelectedClient })] }) })] }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 1, children: (0, jsx_runtime_1.jsx)(material_1.Paper, { sx: { p: 3 }, children: (0, jsx_runtime_1.jsx)(ClientsList_1.default, { clients: clients, onSelect: setSelectedClient }) }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 2, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "Clientes" }), (0, jsx_runtime_1.jsx)(ClientsList_1.default, { clients: clients, onSelect: setSelectedClient, selectedId: selectedClient?.nombre })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 8, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3, minHeight: 400 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "Previsualizaci\u00F3n de Mensaje" }), selectedClient ? ((0, jsx_runtime_1.jsx)(MessagePreview_1.default, { client: selectedClient })) : ((0, jsx_runtime_1.jsx)(material_1.Typography, { color: "textSecondary", align: "center", sx: { mt: 8 }, children: "Selecciona un cliente para ver sus mensajes" }))] }) })] }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 3, children: (0, jsx_runtime_1.jsx)(LogsViewer_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 4, children: (0, jsx_runtime_1.jsx)(Settings_1.default, {}) })] }) }), clients.length > 0 && !isProcessing && ((0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "Enviar mensajes", children: (0, jsx_runtime_1.jsx)(material_1.Fab, { color: "primary", sx: { position: 'fixed', bottom: 32, right: 32 }, onClick: () => {
                        if (window.electronAPI) {
                            window.electronAPI.send('send-citas', {});
                        }
                    }, children: (0, jsx_runtime_1.jsx)(icons_material_1.Send, {}) }) })), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackbar.open, autoHideDuration: 6000, onClose: () => setSnackbar({ ...snackbar, open: false }), children: (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: snackbar.severity, sx: { width: '100%' }, children: snackbar.message }) })] }));
};
exports.default = Dashboard;
//# sourceMappingURL=Dashboard.js.map