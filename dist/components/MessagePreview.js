"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const MessagePreview = ({ client }) => {
    if (!client)
        return null;
    const ownMessages = client.mensajes.filter((m) => m.esPropio);
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 2, mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: client.nombre }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: `${client.mascotas.length} mascotas`, size: "small", variant: "outlined" }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: client.telefono, size: "small", variant: "outlined" })] }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { maxHeight: 500, overflow: 'auto' }, children: [ownMessages.map((msg, index) => ((0, jsx_runtime_1.jsxs)(material_1.Paper, { className: "message-preview own", sx: {
                            p: 2,
                            mb: 2,
                            bgcolor: '#e8f5e9',
                            borderLeft: '4px solid #25D366'
                        }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { display: "flex", alignItems: "center", gap: 1, mb: 1, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Person, { fontSize: "small", color: "action" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "caption", color: "textSecondary", children: ["Mensaje ", index + 1] }), (0, jsx_runtime_1.jsx)(material_1.Box, { flex: 1 }), (0, jsx_runtime_1.jsx)(icons_material_1.AccessTime, { fontSize: "small", color: "action" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", color: "textSecondary", children: msg.timestamp })] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", sx: {
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word',
                                    fontFamily: 'monospace',
                                    fontSize: '13px'
                                }, children: msg.contenido })] }, index))), ownMessages.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.Typography, { color: "textSecondary", align: "center", sx: { py: 4 }, children: "No hay mensajes generados para este cliente" }))] })] }));
};
exports.default = MessagePreview;
//# sourceMappingURL=MessagePreview.js.map