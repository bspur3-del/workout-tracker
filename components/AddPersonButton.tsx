'use client';

import { useState } from 'react';
import { addUserAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function AddPersonButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await addUserAction(trimmed);
      setName('');
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-2xl text-sm font-bold transition-all active:opacity-75"
        style={{ background: 'var(--card)', color: 'var(--muted)', border: '1px dashed var(--border)' }}
      >
        + Add person
      </button>
    );
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <p className="text-sm font-bold mb-3" style={{ color: '#fff' }}>Add a new person</p>
      <input
        autoFocus
        type="text"
        placeholder="Name"
        value={name}
        maxLength={30}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        className="w-full px-4 py-3 rounded-xl text-base mb-3"
        style={{
          background: '#1e1e1e',
          border: '1px solid var(--border)',
          color: '#fff',
          outline: 'none',
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={!name.trim() || saving}
          className="flex-1 py-3 rounded-xl text-sm font-black transition-all active:opacity-75 disabled:opacity-40"
          style={{ background: 'var(--green)', color: '#000' }}
        >
          {saving ? 'Adding...' : 'Add'}
        </button>
        <button
          onClick={() => { setOpen(false); setName(''); }}
          className="px-5 py-3 rounded-xl text-sm font-bold"
          style={{ background: '#1e1e1e', color: 'var(--muted)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
