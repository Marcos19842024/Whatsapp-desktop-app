"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const StatsCards = ({ stats }) => {
    const cards = [
        {
            title: 'Total Clientes',
            value: stats.total,
            icon: (0, jsx_runtime_1.jsx)(icons_material_1.People, { sx: { fontSize: 40 } }),
            color: '#1976d2',
            bg: '#e3f2fd'
        },
        {
            title: 'Enviados',
            value: stats.enviados,
            icon: (0, jsx_runtime_1.jsx)(icons_material_1.CheckCircle, { sx: { fontSize: 40 } }),
            color: '#2e7d32',
            bg: '#e8f5e9'
        },
        {
            title: 'Fallidos',
            value: stats.fallidos,
            icon: (0, jsx_runtime_1.jsx)(icons_material_1.Error, { sx: { fontSize: 40 } }),
            color: '#c62828',
            bg: '#ffebee'
        },
        {
            title: 'Pendientes',
            value: stats.pendientes,
            icon: (0, jsx_runtime_1.jsx)(icons_material_1.Pending, { sx: { fontSize: 40 } }),
            color: '#e65100',
            bg: '#fff3e0'
        }
    ];
    return ((0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 3, children: cards.map((card, index) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, md: 3, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { className: "stat-card", sx: {
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: card.bg
                }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: card.title }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", sx: { fontWeight: 600, color: card.color }, children: card.value })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { color: card.color, opacity: 0.8 }, children: card.icon })] }) }, index))) }));
};
exports.default = StatsCards;
//# sourceMappingURL=StatsCards.js.map