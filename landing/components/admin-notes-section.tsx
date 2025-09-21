import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  MessageSquare, 
  Lock, 
  Globe, 
  Plus, 
  User,
  Calendar,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { useClientNotes } from '@/hooks/use-client-notes';

interface AdminNotesSectionProps {
  brandId: number;
  clientId: number;
  clientName: string;
}

export const AdminNotesSection: React.FC<AdminNotesSectionProps> = ({
  brandId,
  clientId,
  clientName
}) => {
  const {
    notes,
    loading,
    error,
    totalNotes,
    addNote,
    updateNote,
    deleteNote,
    refresh
  } = useClientNotes({ brandId, clientId });

  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingIsPrivate, setEditingIsPrivate] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim() || submitting) return;
    
    setSubmitting(true);
    const success = await addNote(newNote, isPrivate);
    
    if (success) {
      setNewNote('');
      setIsPrivate(false);
      setShowAddNote(false);
    }
    setSubmitting(false);
  };

  const startEditing = (noteId: number, text: string, isPrivate: boolean) => {
    setEditingNoteId(noteId);
    setEditingText(text);
    setEditingIsPrivate(isPrivate);
  };

  const handleUpdate = async (noteId: number) => {
    if (!editingText.trim()) return;
    
    const success = await updateNote(noteId, editingText, editingIsPrivate);
    if (success) {
      setEditingNoteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Cargando notas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Notas del Cliente
            {totalNotes > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({totalNotes})
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Información administrativa sobre {clientName}
          </p>
        </div>
        <button
          onClick={() => setShowAddNote(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nota</span>
        </button>
      </div>

      {/* Formulario agregar nota */}
      {showAddNote && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Escribe información importante sobre el cliente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              maxLength={500}
              autoFocus
            />
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Nota privada</span>
                <Lock className="w-3 h-3 text-gray-500" />
              </label>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowAddNote(false);
                    setNewNote('');
                    setIsPrivate(false);
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || submitting}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de notas */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Sin notas registradas</p>
            <p className="text-sm text-gray-500 mt-1">
              Las notas te ayudan a mantener información importante sobre el cliente
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {editingNoteId === note.id ? (
                // Modo edición
                <div className="space-y-3">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    maxLength={500}
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingIsPrivate}
                        onChange={(e) => setEditingIsPrivate(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Nota privada</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdate(note.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Modo visualización
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {note.isPrivate ? (
                        <Lock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Globe className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-xs font-medium text-gray-600">
                        {note.isPrivate ? 'Nota Privada' : 'Nota Pública'}
                      </span>
                    </div>
                    
                    <p className="text-gray-800 whitespace-pre-wrap">{note.note}</p>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{note.creator.firstName} {note.creator.lastName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => startEditing(note.id, note.note, note.isPrivate)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};