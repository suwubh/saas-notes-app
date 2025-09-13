import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Note } from '../utils/types';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes');
      setNotes(response.data.notes);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (title: string, content: string) => {
    const response = await api.post('/notes', { title, content });
    await fetchNotes();
    return response.data;
  };

  const deleteNote = async (id: string) => {
    await api.delete(`/notes/${id}`);
    await fetchNotes();
  };

  const updateNote = async (id: string, title: string, content: string) => {
    const response = await api.put(`/notes/${id}`, { title, content });
    await fetchNotes();
    return response.data;
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    deleteNote,
    updateNote
  };
};
