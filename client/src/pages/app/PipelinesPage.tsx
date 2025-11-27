import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import dayjs from 'dayjs';
import { api } from '../../lib/api';
import type { PipelineBoard } from '../../types';

const fetchPipelineBoard = async () => {
  const { data } = await api.get<{ board: PipelineBoard[] }>('/pipelines/board');
  return data.board;
};

export const PipelinesPage = () => {
  const queryClient = useQueryClient();
  const { data: board } = useQuery({ queryKey: ['pipeline-board'], queryFn: fetchPipelineBoard });
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPipelineId && board?.length) {
      setSelectedPipelineId(board[0].id);
    }
  }, [board, selectedPipelineId]);

  const pipeline = useMemo(
    () => board?.find((p) => p.id === selectedPipelineId) ?? board?.[0],
    [board, selectedPipelineId],
  );

  const moveMutation = useMutation({
    mutationFn: (payload: { contactId: string; stageId: string }) =>
      api.post(`/contacts/${payload.contactId}/stage`, { stageId: payload.stageId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pipeline-board'] }),
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.droppableId === result.source.droppableId) {
      return;
    }
    moveMutation.mutate({
      contactId: result.draggableId,
      stageId: result.destination.droppableId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline board</h1>
          <p className="text-sm text-slate-500">
            Drag cards between stages to move deals. Use the dropdown to switch pipelines.
          </p>
        </div>
        {board?.length ? (
          <select
            value={pipeline?.id ?? ''}
            onChange={(event) => setSelectedPipelineId(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none sm:w-64"
          >
            {board.map((pipelineOption) => (
              <option key={pipelineOption.id} value={pipelineOption.id}>
                {pipelineOption.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {pipeline ? (
        <div className="overflow-x-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex min-w-fit gap-4 pb-4">
              {pipeline.stages.map((stage) => (
                <Droppable droppableId={stage.id} key={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex w-72 flex-col rounded-3xl border border-slate-100 bg-white shadow-card transition ${
                        snapshot.isDraggingOver ? 'ring-2 ring-brand/50' : ''
                      }`}
                    >
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{stage.name}</p>
                        <p className="text-2xl font-bold text-slate-900">{stage.contacts.length}</p>
                      </div>
                      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
                        {stage.contacts.map((contact, index) => (
                          <Draggable draggableId={contact.id} index={index} key={contact.id}>
                            {(dragProvided) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700 shadow-sm"
                              >
                                <p className="font-semibold text-slate-900">{contact.name}</p>
                                <p className="text-xs text-slate-500">{contact.email ?? 'No email'}</p>
                                {contact.tags.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {contact.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {contact.nextTask && (
                                  <p className="mt-2 text-xs text-slate-500">
                                    Next task:{' '}
                                    <span className="font-semibold text-slate-900">{contact.nextTask.title}</span>{' '}
                                    {contact.nextTask.dueDate &&
                                      `· ${dayjs(contact.nextTask.dueDate).format('MMM D, HH:mm')}`}
                                  </p>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {!stage.contacts.length && (
                          <p className="text-xs text-slate-400">Drop a contact here to fill this stage.</p>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Create a pipeline and add contacts to see the board.
        </div>
      )}
    </div>
  );
};

