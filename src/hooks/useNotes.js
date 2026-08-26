import { useEffect, useMemo, useReducer } from 'react'
import { loadNotes, saveNotes } from '../utils/storage'

function makeNote(overrides = {}) {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: '',
    content: '',
    color: 'bg-white',
    pinned: false,
    archived: false,
    trashed: false,
    labels: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function seedNotes() {
  return [
    makeNote({
      title: 'Welcome to Keep Clone',
      content: 'Click the "Take a note..." box to get started. Notes are saved to your browser only.',
      color: 'bg-yellow-100',
      pinned: true,
    }),
    makeNote({
      title: 'Grocery list',
      content: 'Milk, eggs, bread, coffee, spinach',
      color: 'bg-green-100',
      labels: ['Personal'],
    }),
    makeNote({
      title: 'Project ideas',
      content: 'Sticky notes clone, weather widget, habit tracker',
      color: 'bg-blue-100',
      labels: ['Work'],
    }),
  ]
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      return [action.note, ...state]
    }
    case 'UPDATE': {
      return state.map((n) =>
        n.id === action.id ? { ...n, ...action.changes, updatedAt: Date.now() } : n,
      )
    }
    case 'DELETE': {
      return state.map((n) =>
        n.id === action.id ? { ...n, trashed: true, pinned: false, updatedAt: Date.now() } : n,
      )
    }
    case 'RESTORE': {
      return state.map((n) =>
        n.id === action.id ? { ...n, trashed: false, updatedAt: Date.now() } : n,
      )
    }
    case 'PERMANENT_DELETE': {
      return state.filter((n) => n.id !== action.id)
    }
    case 'TOGGLE_PIN': {
      return state.map((n) =>
        n.id === action.id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n,
      )
    }
    case 'TOGGLE_ARCHIVE': {
      return state.map((n) =>
        n.id === action.id
          ? { ...n, archived: !n.archived, pinned: false, updatedAt: Date.now() }
          : n,
      )
    }
    case 'SET_COLOR': {
      return state.map((n) =>
        n.id === action.id ? { ...n, color: action.color, updatedAt: Date.now() } : n,
      )
    }
    case 'ADD_LABEL': {
      return state.map((n) =>
        n.id === action.id && !n.labels.includes(action.label)
          ? { ...n, labels: [...n.labels, action.label], updatedAt: Date.now() }
          : n,
      )
    }
    case 'REMOVE_LABEL': {
      return state.map((n) =>
        n.id === action.id
          ? { ...n, labels: n.labels.filter((l) => l !== action.label), updatedAt: Date.now() }
          : n,
      )
    }
    case 'REMOVE_LABEL_EVERYWHERE': {
      return state.map((n) =>
        n.labels.includes(action.label)
          ? { ...n, labels: n.labels.filter((l) => l !== action.label), updatedAt: Date.now() }
          : n,
      )
    }
    case 'RENAME_LABEL_EVERYWHERE': {
      return state.map((n) =>
        n.labels.includes(action.oldLabel)
          ? {
              ...n,
              labels: n.labels.map((l) => (l === action.oldLabel ? action.newLabel : l)),
              updatedAt: Date.now(),
            }
          : n,
      )
    }
    default:
      return state
  }
}

function init() {
  const stored = loadNotes()
  if (stored) return stored
  return seedNotes()
}

export function useNotes() {
  const [notes, dispatch] = useReducer(reducer, undefined, init)

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  const labels = useMemo(() => {
    const set = new Set()
    notes.forEach((n) => n.labels.forEach((l) => set.add(l)))
    return Array.from(set).sort()
  }, [notes])

  const actions = useMemo(
    () => ({
      addNote: (fields) => dispatch({ type: 'ADD', note: makeNote(fields) }),
      updateNote: (id, changes) => dispatch({ type: 'UPDATE', id, changes }),
      deleteNote: (id) => dispatch({ type: 'DELETE', id }),
      restoreNote: (id) => dispatch({ type: 'RESTORE', id }),
      permanentDelete: (id) => dispatch({ type: 'PERMANENT_DELETE', id }),
      togglePin: (id) => dispatch({ type: 'TOGGLE_PIN', id }),
      toggleArchive: (id) => dispatch({ type: 'TOGGLE_ARCHIVE', id }),
      setColor: (id, color) => dispatch({ type: 'SET_COLOR', id, color }),
      addLabel: (id, label) => dispatch({ type: 'ADD_LABEL', id, label }),
      removeLabel: (id, label) => dispatch({ type: 'REMOVE_LABEL', id, label }),
      removeLabelEverywhere: (label) => dispatch({ type: 'REMOVE_LABEL_EVERYWHERE', label }),
      renameLabelEverywhere: (oldLabel, newLabel) =>
        dispatch({ type: 'RENAME_LABEL_EVERYWHERE', oldLabel, newLabel }),
    }),
    [],
  )

  return { notes, labels, ...actions }
}
