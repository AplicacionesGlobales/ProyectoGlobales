import { useState, useEffect, useCallback } from 'react';
import { clientsService, ClientNote } from '@/services/client.service';

interface UseClientNotesOptions {
  brandId: number;
  clientId: number;
  autoLoad?: boolean;
}

interface UseClientNotesReturn {
  notes: ClientNote[];
  loading: boolean;
  error: string | null;
  totalNotes: number;
  loadNotes: () => Promise<void>;
  addNote: (note: string, isPrivate: boolean) => Promise<boolean>;
  updateNote: (noteId: number, note: string, isPrivate: boolean) => Promise<boolean>;
  deleteNote: (noteId: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const useClientNotes = ({
  brandId,
  clientId,
  autoLoad = true
}: UseClientNotesOptions): UseClientNotesReturn => {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    if (!brandId || !clientId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientsService.getClientNotes(brandId, clientId);
      
      if (response.success && response.data) {
        setNotes(response.data.notes || []);
      } else {
        setError('Error al cargar las notas');
      }
    } catch (err) {
      setError('Error al cargar las notas');
    } finally {
      setLoading(false);
    }
  }, [brandId, clientId]);

  const addNote = useCallback(async (note: string, isPrivate: boolean): Promise<boolean> => {
    if (!note.trim()) {
      setError('La nota no puede estar vacía');
      return false;
    }
    
    try {
      setError(null);
      
      const response = await clientsService.createClientNote(brandId, clientId, {
        note: note.trim(),
        isPrivate
      });
      
      if (response.success && response.data) {
        setNotes(prev => [response.data as ClientNote, ...prev]);
        return true;
      }
      
      setError('Error al crear la nota');
      return false;
      
    } catch (err) {
      setError('Error al agregar la nota');
      return false;
    }
  }, [brandId, clientId]);

  const updateNote = useCallback(async (
    noteId: number, 
    note: string, 
    isPrivate: boolean
  ): Promise<boolean> => {
    if (!note.trim()) {
      setError('La nota no puede estar vacía');
      return false;
    }
    
    try {
      setError(null);
      
      const response = await clientsService.updateClientNote(
        brandId, 
        clientId, 
        noteId, 
        { note: note.trim(), isPrivate }
      );
      
      if (response.success && response.data) {
        setNotes(prev => prev.map(n => 
          n.id === noteId ? response.data as ClientNote : n
        ));
        return true;
      }
      
      setError('Error al actualizar la nota');
      return false;
      
    } catch (err) {
      setError('Error al actualizar la nota');
      return false;
    }
  }, [brandId, clientId]);

  const deleteNote = useCallback(async (noteId: number): Promise<boolean> => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
      return false;
    }
    
    try {
      setError(null);
      
      const response = await clientsService.deleteClientNote(brandId, clientId, noteId);
      
      if (response.success) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
        return true;
      }
      
      setError('Error al eliminar la nota');
      return false;
      
    } catch (err) {
      setError('Error al eliminar la nota');
      return false;
    }
  }, [brandId, clientId]);

  const refresh = useCallback(async () => {
    await loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    if (autoLoad && brandId && clientId) {
      loadNotes();
    }
  }, [brandId, clientId, autoLoad, loadNotes]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    notes,
    loading,
    error,
    totalNotes: notes.length,
    loadNotes,
    addNote,
    updateNote,
    deleteNote,
    refresh
  };
};