import { KanbanBoard } from '../components/KanbanBoard';
import type { Business } from '../types';

interface GestaoLeadsProps {
  businesses: Business[];
}

export function GestaoLeads({ businesses }: GestaoLeadsProps) {
  const handleStatusChange = (business: Business, newStatus: Business['status']) => {
    // TODO: Implementar lógica de atualização de status
    console.log(`Atualizando lead ${business.id} para status ${newStatus}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestão de Leads</h1>
      <KanbanBoard 
        businesses={businesses}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
