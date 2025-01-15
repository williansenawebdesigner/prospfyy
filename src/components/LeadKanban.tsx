import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Star, MessageCircle } from 'lucide-react';
import { Lead } from '../types';
import { LeadDetailsModal } from './LeadDetailsModal';

const LEAD_STATUSES = [
  { id: 'Lead', icon: Star, color: 'blue' },
  { id: 'Contato Realizado', icon: MessageCircle, color: 'yellow' },
  { id: 'Proposta Enviada', icon: MessageCircle, color: 'slate' },
  { id: 'Em Negociação', icon: MessageCircle, color: 'purple' },
  { id: 'Fechado', icon: MessageCircle, color: 'emerald' },
  { id: 'Perdido', icon: MessageCircle, color: 'rose' },
];

interface LeadKanbanProps {
  leads?: Lead[];
  onLeadUpdate?: (lead: Lead) => void;
}

export function LeadKanban({ 
  leads = [], 
  onLeadUpdate = () => {} 
}: LeadKanbanProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Não iniciar o arrasto se estiver arrastando um card
    if (isDragging || (e.target as HTMLElement).closest('[data-rbd-draggable-id]')) {
      return;
    }
    
    if (!containerRef.current) return;
    setIsScrolling(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Não mover se estiver arrastando um card
    if (isDragging || !isScrolling || !containerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsScrolling(false);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const onDragStart = () => {
    setIsDragging(true);
    setIsScrolling(false); // Garante que o arrasto do Kanban é desativado
  };

  const onDragEnd = async (result: any) => {
    setIsDragging(false);
    
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    
    const lead = leads.find(l => l.id === draggableId);
    
    if (lead && lead.status !== destination.droppableId) {
      const updatedLead = { ...lead, status: destination.droppableId };
      onLeadUpdate(updatedLead);
    }
  };

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    onLeadUpdate(updatedLead);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <div 
        ref={containerRef}
        className={`overflow-x-auto scrollbar-hide ${isDragging ? '' : 'cursor-grab active:cursor-grabbing'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => !isDragging && setIsScrolling(false)}
        style={{
          scrollbarWidth: 'none',  /* Firefox */
          msOverflowStyle: 'none',  /* IE and Edge */
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style jsx global>{`
          /* Chrome, Safari e Opera */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="inline-flex gap-4 min-w-max p-2 select-none">
          {LEAD_STATUSES.map(({ id: status, icon: Icon, color }) => (
            <div key={status} className="bg-white dark:bg-gray-800 rounded-lg shadow w-80">
              <div className={`p-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 bg-${color}-50/80 dark:bg-${color}-950/30`}>
                <Icon className={`w-5 h-5 text-${color}-500 dark:text-${color}-400`} />
                <h3 className="font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">{status}</h3>
                <span className="ml-auto bg-white/80 dark:bg-gray-700/80 px-2 py-1 rounded text-sm text-gray-600 dark:text-gray-300">
                  {getLeadsByStatus(status).length}
                </span>
              </div>
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-2 min-h-[calc(100vh-20rem)] transition-colors ${
                      snapshot.isDraggingOver 
                        ? `bg-${color}-50/50 dark:bg-${color}-950/20`
                        : 'bg-white/50 dark:bg-gray-800/50'
                    }`}
                  >
                    {getLeadsByStatus(status).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 mb-2 bg-white dark:bg-gray-700/90 rounded-lg shadow border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow ${
                              snapshot.isDragging 
                                ? 'shadow-lg dark:shadow-black/30 cursor-grabbing' 
                                : ''
                            }`}
                            onClick={() => !isDragging && setSelectedLead(lead)}
                          >
                            <h4 className="font-medium mb-1 text-gray-900 dark:text-gray-100">{lead.name}</h4>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                              <Star className={`w-4 h-4 text-${color}-400 dark:text-${color}-400 mr-1`} />
                              <span>{lead.rating}</span>
                              <span className="mx-1">•</span>
                              <span>{lead.review_count} avaliações</span>
                            </div>
                            {lead.comments && lead.comments.length > 0 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                <MessageCircle className={`w-4 h-4 inline mr-1 text-${color}-400 dark:text-${color}-400`} />
                                {lead.comments.length} comentário(s)
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
      </div>
      {selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}
    </DragDropContext>
  );
}