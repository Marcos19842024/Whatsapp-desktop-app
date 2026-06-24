import React from 'react';
interface ClientsListProps {
    clients: any[];
    onSelect: (client: any) => void;
    selectedId?: string;
}
declare const ClientsList: React.FC<ClientsListProps>;
export default ClientsList;
