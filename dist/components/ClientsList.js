"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const ClientsList = ({ clients, onSelect, selectedId }) => {
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [expanded, setExpanded] = (0, react_1.useState)(null);
    const filteredClients = clients.filter(client => client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.mascotas.some((m) => m.nombre.toLowerCase().includes(searchTerm.toLowerCase())));
    const handleExpand = (clientName) => {
        setExpanded(expanded === clientName ? null : clientName);
    };
    if (clients.length === 0) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { textAlign: 'center', py: 4 }, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { color: "textSecondary", children: "No hay clientes cargados" }) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, variant: "outlined", size: "small", placeholder: "Buscar cliente o mascota...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), sx: { mb: 2 }, InputProps: {
                    startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Search, {}) }))
                } }), (0, jsx_runtime_1.jsx)(material_1.List, { sx: { maxHeight: 400, overflow: 'auto' }, children: filteredClients.map((client) => ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsxs)(material_1.ListItem, { button: true, selected: selectedId === client.nombre, onClick: () => {
                                onSelect(client);
                                handleExpand(client.nombre);
                            }, sx: {
                                borderBottom: '1px solid #f0f0f0',
                                '&:hover': {
                                    background: '#f5f5f5'
                                }
                            }, children: [(0, jsx_runtime_1.jsx)(material_1.ListItemAvatar, { children: (0, jsx_runtime_1.jsx)(material_1.Avatar, { sx: { bgcolor: '#25D366' }, children: client.nombre.charAt(0) }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: (0, jsx_runtime_1.jsxs)(material_1.Box, { display: "flex", alignItems: "center", gap: 1, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", children: client.nombre }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: `${client.mascotas.length} mascotas`, size: "small", icon: (0, jsx_runtime_1.jsx)(icons_material_1.Pets, {}), variant: "outlined" }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: `${client.mensajes.filter((m) => m.esPropio).length} mensajes`, size: "small", color: "primary", variant: "outlined" })] }), secondary: client.telefono }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => handleExpand(client.nombre), children: expanded === client.nombre ? (0, jsx_runtime_1.jsx)(icons_material_1.ExpandLess, {}) : (0, jsx_runtime_1.jsx)(icons_material_1.ExpandMore, {}) })] }), (0, jsx_runtime_1.jsx)(material_1.Collapse, { in: expanded === client.nombre, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { elevation: 0, sx: { p: 2, bgcolor: '#fafafa' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle2", gutterBottom: true, children: "Mascotas:" }), client.mascotas.map((mascota) => ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: mascota.nombre, icon: (0, jsx_runtime_1.jsx)(icons_material_1.Pets, {}), sx: { mr: 1, mb: 1 }, size: "small" }, mascota.nombre)))] }) })] }, client.nombre))) })] }));
};
exports.default = ClientsList;
//# sourceMappingURL=ClientsList.js.map