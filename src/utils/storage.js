const NOTES_KEY = 'keep-clone-notes'

export function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
  } catch {
    // localStorage unavailable or full — silently skip persistence
  }
}
