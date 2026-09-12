import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

// Single-process store: serialize mutations and atomically replace the snapshot.
// Patient identity comes from our configured sender mapping, never from the LLM.
export class NoteStore {
  constructor(directory) { this.directory = directory; this.tail = Promise.resolve(); }
  async init() {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    this.path = join(this.directory, 'voice-notes.json');
    try {
      this.data = JSON.parse(await readFile(this.path, 'utf8'));
      if (this.data.version !== 1 || !Array.isArray(this.data.notes)) throw new Error('Invalid note store');
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      this.data = { version: 1, notes: [] };
    }
    return this;
  }
  async mutate(fn) {
    const task = this.tail.then(async () => {
      const next = structuredClone(this.data);
      const result = fn(next);
      const temp = `${this.path}.${randomUUID()}.tmp`;
      await writeFile(temp, JSON.stringify(next, null, 2), { mode: 0o600 });
      await rename(temp, this.path);
      this.data = next;
      return structuredClone(result);
    });
    this.tail = task.catch(() => {});
    return task;
  }
  list() { return structuredClone(this.data.notes).reverse(); }
  get(id) { return structuredClone(this.data.notes.find(n => n.id === id)); }
  async receive({ id, patientId, source, transcript = null, audio = null, whatsapp = null }) {
    return this.mutate(data => {
      const existing = data.notes.find(n => n.id === id);
      if (existing) {
        if (existing.patientId !== patientId) throw new Error('Message identity conflict');
        return existing;
      }
      const note = { id, patientId, source, receivedAt: new Date().toISOString(),
        status: 'received', transcript, audio, whatsapp, extraction: null, error: null,
        replyStatus: 'not_sent', reviewedAt: null };
      data.notes.push(note);
      return note;
    });
  }
  async update(id, patch) {
    return this.mutate(data => {
      const note = data.notes.find(n => n.id === id);
      if (!note) throw new Error('Note not found');
      Object.assign(note, patch);
      return note;
    });
  }
  publicNotes() { return this.list().map(({ audio, whatsapp, ...note }) => note); }
}
