import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../../lib/api';
import type { Contact } from '../../types';

type Note = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type Revision = {
  id: string;
  content: string;
  createdAt: string;
};

type NotesDrawerProps = {
  contact: Contact;
  onClose: () => void;
};

const fetchNotes = async (contactId: string) => {
  const { data } = await api.get<{ notes: Note[] }>(`/notes/contacts/${contactId}`);
  return data.notes;
};

const fetchRevisions = async (noteId: string) => {
  const { data } = await api.get<{ revisions: Revision[] }>(`/notes/${noteId}/revisions`);
  return data.revisions;
};

export const NotesDrawer = ({ contact, onClose }: NotesDrawerProps) => {
  const queryClient = useQueryClient();
  const { data: notes } = useQuery({ queryKey: ['contact-notes', contact.id], queryFn: () => fetchNotes(contact.id) });
  const [content, setContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [openHistoryNoteId, setOpenHistoryNoteId] = useState<string | null>(null);

  const historyQuery = useQuery({
    queryKey: ['note-revisions', openHistoryNoteId],
    queryFn: () => fetchRevisions(openHistoryNoteId as string),
    enabled: !!openHistoryNoteId,
  });

  const createMutation = useMutation({
    mutationFn: (body: { content: string }) => api.post(`/notes/contacts/${contact.id}`, body),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contact.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: { noteId: string; content: string }) => api.put(`/notes/${body.noteId}`, { content: body.content }),
    onSuccess: () => {
      setEditingNote(null);
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contact.id] });
      if (openHistoryNoteId) {
        queryClient.invalidateQueries({ queryKey: ['note-revisions', openHistoryNoteId] });
      }
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    if (editingNote) {
      updateMutation.mutate({ noteId: editingNote.id, content });
    } else {
      createMutation.mutate({ content });
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setContent(note.content);
    setShowPreview(false);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="h-full w-full bg-slate-900/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand">Notes</p>
            <h2 className="text-lg font-semibold text-slate-900">{contact.name}</h2>
          </div>
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-900">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{editingNote ? 'Edit note' : 'Add note'}</h3>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <input type="checkbox" checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} />
                Preview
              </label>
            </div>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Use markdown to capture call summaries, next steps, etc."
              className="mt-3 h-32 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
            />
            {showPreview && (
              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 prose prose-slate">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '_Nothing to preview_'}</ReactMarkdown>
              </div>
            )}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSubmit}
                className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingNote ? 'Update note' : 'Save note'}
              </button>
              {editingNote && (
                <button onClick={cancelEditing} className="text-xs font-semibold text-slate-500 underline">
                  Cancel edit
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {notes?.map((note) => (
              <div key={note.id} className="rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(note.updatedAt).toLocaleString()}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => startEditing(note)} className="font-semibold text-brand">
                      Edit
                    </button>
                    <button
                      onClick={() => setOpenHistoryNoteId((prev) => (prev === note.id ? null : note.id))}
                      className="font-semibold text-slate-500"
                    >
                      History
                    </button>
                  </div>
                </div>
                <div className="prose prose-slate mt-3 max-w-none text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
                </div>
                {openHistoryNoteId === note.id && (
                  <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                    <p className="font-semibold text-slate-900">Revisions</p>
                    {historyQuery.isLoading && <p className="mt-2">Loading history…</p>}
                    {historyQuery.data?.map((revision) => (
                      <div key={revision.id} className="mt-2 border-t border-slate-100 pt-2">
                        <p className="text-[11px] uppercase tracking-widest text-slate-400">
                          {new Date(revision.createdAt).toLocaleString()}
                        </p>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{revision.content}</ReactMarkdown>
                      </div>
                    ))}
                    {!historyQuery.isLoading && !historyQuery.data?.length && (
                      <p className="mt-2 text-slate-400">No revisions yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {!notes?.length && <p className="text-sm text-slate-500">No notes yet. Start by adding one above.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

