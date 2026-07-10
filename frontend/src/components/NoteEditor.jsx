import { useState, useEffect } from 'react';
import api from '../api';

export default function NoteEditor({ lessonId, courseId }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchNote();
  }, [lessonId]);

  const fetchNote = async () => {
    try {
      const response = await api.get(`/notes/lesson/${lessonId}`);
      if (response.data.data) {
        setNote(response.data.data.content);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.post('/notes', {
        lessonId,
        courseId,
        content: note,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading notes...</div>;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <h3 className="font-semibold text-gray-800 mb-2">📝 Your Notes</h3>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write your private notes for this lesson..."
        className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      <div className="flex justify-between items-center mt-2">
        {saved && <span className="text-green-600 text-sm">Saved!</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
