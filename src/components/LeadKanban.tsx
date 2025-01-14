import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DroppableStateSnapshot, DraggableStateSnapshot, DropResult } from 'react-beautiful-dnd';
import { Star, MessageCircle, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';
import type { Lead } from '../types';
import { supabase } from '../lib/supabase';
import { LeadDetailsModal } from './LeadDetailsModal';

const LEAD_STATUSES = [
  { id: 'Lead', icon: Star, color: 'blue' },
  { id: 'Contatado', icon: MessageCircle, color: 'purple' },
  { id: 'Reunião Agendada', icon: Calendar, color: 'orange' },
  { id: 'Proposta Enviada', icon: FileText, color: 'yellow' },
  { id: 'Fechado', icon: CheckCircle, color: 'green' },
  { id: 'Perdido', icon: XCircle, color: 'red' }
] as const;

interface LeadKanbanProps {
  leads: Lead[];
  onLeadUpdate: () => void;
}

export function LeadKanban({ leads, onLeadUpdate }: LeadKanbanProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const getLeadsByStatus = (status: Lead['status']) => {
    return leads.filter(lead => lead.status === status);
  };

  const onDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const lead = leads.find(l => l.id === draggableId);
    
    if (!lead) return;
    
    const newStatus = destination.droppableId as Lead['status'];
    if (lead.status === newStatus) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);

      if (error) throw error;

      onLeadUpdate();
    } catch (error) {
      console.error('Erro ao atualizar status do lead:', error);
      alert('Erro ao mover o lead. Por favor, tente novamente.');
    }
  };

  return (
    <>
      <div className="h-full overflow-x-auto">
        <DragDropContext
          onDragStart={() => setIsDragging(true)}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-4 p-4 h-full">
            {LEAD_STATUSES.map(({ id, icon: Icon, color }) => (
              <div
                key={id}
                className="flex-shrink-0 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col h-full"
              >
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 text-${color}-500`} />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{id}</h3>
                    <span className="ml-auto bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm px-2 py-0.5 rounded-lg">
                      {getLeadsByStatus(id).length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={id}>
                  {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-2 space-y-2 overflow-y-auto ${
                        snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      {getLeadsByStatus(id).map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => !isDragging && setSelectedLead(lead)}
                              className={`p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 dark:ring-blue-400' : ''
                              }`}
                            >
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                {lead.name}
                              </h4>
                              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span>{lead.rating}</span>
                                <span className="text-xs">({lead.review_count})</span>
                              </div>
                              {lead.comments.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                    <MessageCircle className="h-4 w-4" />
                                    <span>{lead.comments.length} comentário(s)</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={onLeadUpdate}
        />
      )}
    </>
  );
} 