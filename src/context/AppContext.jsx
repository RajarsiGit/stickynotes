import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, notesApi } from '../utils/api'

const AppContext = createContext()

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const { user: currentUser } = await authApi.getCurrentUser()
      setUser(currentUser)
      const fetchedNotes = await notesApi.getAll()
      setNotes(fetchedNotes)
    } catch {
      setUser(null)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const patchNote = useCallback(async (id, updates) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n,
      ),
    )
    try {
      await notesApi.update(id, updates)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const addNote = useCallback(async (fields) => {
    const note = await notesApi.create(fields)
    setNotes((prev) => [note, ...prev])
  }, [])

  const permanentDelete = useCallback(async (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    await notesApi.delete(id)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
    setNotes([])
  }, [])

  const labels = useMemo(() => {
    const set = new Set()
    notes.forEach((n) => n.labels.forEach((l) => set.add(l)))
    return Array.from(set).sort()
  }, [notes])

  const value = useMemo(() => {
    function findNote(id) {
      return notes.find((n) => n.id === id)
    }

    return {
      user,
      notes,
      labels,
      loading,
      loadData,
      logout,
      addNote,
      updateNote: patchNote,
      deleteNote: (id) => patchNote(id, { trashed: true, pinned: false }),
      restoreNote: (id) => patchNote(id, { trashed: false }),
      permanentDelete,
      togglePin: (id) => {
        const note = findNote(id)
        if (note) patchNote(id, { pinned: !note.pinned })
      },
      toggleArchive: (id) => {
        const note = findNote(id)
        if (note) patchNote(id, { archived: !note.archived, pinned: false })
      },
      setColor: (id, color) => patchNote(id, { color }),
      addLabel: (id, label) => {
        const note = findNote(id)
        if (note && !note.labels.includes(label)) {
          patchNote(id, { labels: [...note.labels, label] })
        }
      },
      removeLabel: (id, label) => {
        const note = findNote(id)
        if (note) patchNote(id, { labels: note.labels.filter((l) => l !== label) })
      },
      removeLabelEverywhere: (label) => {
        notes
          .filter((n) => n.labels.includes(label))
          .forEach((n) => patchNote(n.id, { labels: n.labels.filter((l) => l !== label) }))
      },
      renameLabelEverywhere: (oldLabel, newLabel) => {
        notes
          .filter((n) => n.labels.includes(oldLabel))
          .forEach((n) =>
            patchNote(n.id, { labels: n.labels.map((l) => (l === oldLabel ? newLabel : l)) }),
          )
      },
    }
  }, [user, notes, labels, loading, loadData, logout, addNote, patchNote, permanentDelete])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
