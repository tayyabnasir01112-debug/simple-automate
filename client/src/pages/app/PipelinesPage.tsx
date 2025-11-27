import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { api } from '../../lib/api';
import type { Pipeline } from '../../types';

const fetchPipelines = async () => {
  const { data } = await api.get<{ pipelines: Pipeline[] }>('/pipelines');
  return data.pipelines;
};

export const PipelinesPage = () => {
  const queryClient = useQueryClient();
  const { data: pipelines } = useQuery({ queryKey: ['pipelines'], queryFn: fetchPipelines });
  const activePipeline = pipelines?.[0];

  const reorderMutation = useMutation({
    mutationFn: (stageOrder: string[]) =>
      api.put(`/pipelines/${activePipeline?.id}/stages/reorder`, { stageOrder }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pipelines'] }),
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !activePipeline) return;
    const updated = Array.from(activePipeline.stages);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    reorderMutation.mutate(updated.map((stage) => stage.id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
      <p className="mt-2 text-sm text-slate-500">Drag cards to reorder stages for your primary pipeline.</p>
      {activePipeline ? (
        <div className="mt-8 overflow-x-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="stages" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-4 min-w-fit"
                >
                  {activePipeline.stages
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((stage, index) => (
                      <Draggable key={stage.id} draggableId={stage.id} index={index}>
                        {(draggableProvided) => (
                          <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                            className="w-64 shrink-0 rounded-3xl border border-slate-100 bg-white p-4 shadow-card"
                          >
                            <p className="font-semibold text-slate-900">{stage.name}</p>
                            <p className="text-xs text-slate-500">Drop here to reorder</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-500">No pipeline found yet.</p>
      )}
    </div>
  );
};

