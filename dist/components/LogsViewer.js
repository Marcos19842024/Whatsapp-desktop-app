"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_toastify_1 = require("react-toastify");
const LogsViewer = () => {
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [selectedLog, setSelectedLog] = (0, react_1.useState)(null);
    const [logContent, setLogContent] = (0, react_1.useState)('');
    const [openDialog, setOpenDialog] = (0, react_1.useState)(false);
    const loadLogs = async () => {
        setLoading(true);
        if (window.electronAPI) {
            window.electronAPI.send('get-logs');
        }
        setLoading(false);
    };
    (0, react_1.useEffect)(() => {
        if (window.electronAPI) {
            window.electronAPI.on('log-update', (data) => {
                setLogs(data);
            });
        }
        loadLogs();
    }, []);
    const handleViewLog = async (log) => {
        setSelectedLog(log);
        try {
            if (window.electronAPI) {
                // Simular lectura de log
                const content = `Fecha: ${log.modified}\nTamaño: ${log.size} bytes\n\nContenido del log...`;
                setLogContent(content);
                setOpenDialog(true);
            }
        }
        catch (error) {
            react_toastify_1.toast.error('Error al leer el log');
        }
    };
    const handleDeleteLog = async (logName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar ${logName}?`)) {
            try {
                // Simular eliminación
                react_toastify_1.toast.success(`Log ${logName} eliminado`);
                loadLogs();
            }
            catch (error) {
                react_toastify_1.toast.error('Error al eliminar el log');
            }
        }
    };
    const handleClearAll = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar todos los logs?')) {
            if (window.electronAPI) {
                window.electronAPI.send('clear-logs');
                react_toastify_1.toast.success('Todos los logs eliminados');
                loadLogs();
            }
        }
    };
    const formatSize = (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "Registros de Env\u00EDos" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Refresh, {}), onClick: loadLogs, disabled: loading, sx: { mr: 1 }, children: "Actualizar" }), (0, jsx_runtime_1.jsx)(material_1.Button, { startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Clear, {}), color: "error", onClick: handleClearAll, disabled: logs.length === 0, children: "Limpiar Todo" })] })] }), logs.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "info", children: "No hay registros de env\u00EDos disponibles" })) : ((0, jsx_runtime_1.jsx)(material_1.List, { children: logs.map((log, index) => ((0, jsx_runtime_1.jsxs)(material_1.ListItem, { divider: true, sx: {
                                '&:hover': {
                                    bgcolor: '#f5f5f5'
                                }
                            }, children: [(0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: log.name, secondary: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Chip, { label: `Tamaño: ${formatSize(log.size)}`, size: "small", variant: "outlined", sx: { mr: 1 } }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: `Modificado: ${log.modified.toLocaleString()}`, size: "small", variant: "outlined" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.ListItemSecondaryAction, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { edge: "end", onClick: () => handleViewLog(log), title: "Ver log", children: (0, jsx_runtime_1.jsx)(icons_material_1.Visibility, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { edge: "end", onClick: () => handleDeleteLog(log.name), title: "Eliminar log", children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] })] }, index))) }))] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: openDialog, onClose: () => setOpenDialog(false), maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: selectedLog?.name }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.TextField, { multiline: true, fullWidth: true, rows: 15, value: logContent, variant: "outlined", InputProps: {
                                readOnly: true,
                                sx: {
                                    fontFamily: 'monospace',
                                    fontSize: '13px'
                                }
                            } }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setOpenDialog(false), children: "Cerrar" }), (0, jsx_runtime_1.jsx)(material_1.Button, { startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Download, {}), onClick: () => {
                                    react_toastify_1.toast.info('Descargando log...');
                                }, children: "Descargar" })] })] })] }));
};
exports.default = LogsViewer;
//# sourceMappingURL=LogsViewer.js.map