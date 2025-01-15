import { useState } from 'react';
import { Business, BusinessStatus } from '../types';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';

interface KanbanBoardProps {
  businesses: Business[];
  onStatusChange: (business: Business, newStatus: BusinessStatus) => void;
}

const statusColumns: BusinessStatus[] = [
  'Lead',
  'Contato Realizado', 
  'Proposta Enviada',
  'Em Negociação',
  'Fechado',
  'Perdido'
];

export function KanbanBoard({ businesses, onStatusChange }: KanbanBoardProps) {
  const [localBusinesses, setLocalBusinesses] = useState(businesses);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const business = localBusinesses.find(b => b.name === draggableId);
    if (!business) return;

    const newStatus = destination.droppableId as BusinessStatus;
    const updatedBusiness = { ...business, status: newStatus };

    const newBusinesses = Array.from(localBusinesses);
    newBusinesses.splice(source.index, 1);
    newBusinesses.splice(destination.index, 0, updatedBusiness);

    setLocalBusinesses(newBusinesses);
    onStatusChange(updatedBusiness, newStatus);
  };

  const getBusinessesByStatus = (status: BusinessStatus) => 
    localBusinesses.filter(b => b.status === status);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-6 gap-4 p-4">
        {statusColumns.map(status => (
          <Droppable key={status} droppableId={status}>
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="bg-gray-50 rounded-lg p-4"
              >
                <h3 className="font-semibold text-lg mb-4">{status}</h3>
                {getBusinessesByStatus(status).map((business, index) => (
                  <Draggable key={business.name} draggableId={business.name} index={index}>
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white p-4 rounded-lg shadow mb-4"
                      >
                        <h4 className="font-medium">{business.name}</h4>
                        <p className="text-sm text-gray-600">{business.address}</p>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
