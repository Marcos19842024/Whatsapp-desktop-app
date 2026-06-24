import React from 'react';
interface StatsCardsProps {
    stats: {
        total: number;
        enviados: number;
        fallidos: number;
        pendientes: number;
    };
}
declare const StatsCards: React.FC<StatsCardsProps>;
export default StatsCards;
