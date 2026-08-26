import { useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import NoteInput from './components/NoteInput'
import NoteGrid from './components/NoteGrid'
import { useNotes } from './hooks/useNotes'

function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function App() {
  const notesApi = useNotes()
  const { notes, labels } = notesApi
  const [view, setView] = useState('notes')
  const [activeLabel, setActiveLabel] = useState(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounced(search, 250)

  function selectView(next) {
    setView(next)
    setActiveLabel(null)
  }

  function selectLabel(label) {
    setView('label')
    setActiveLabel(label)
  }

  const filteredNotes = useMemo(() => {
    let list = notes
    if (view === 'notes') list = list.filter((n) => !n.archived && !n.trashed)
    else if (view === 'archive') list = list.filter((n) => n.archived && !n.trashed)
    else if (view === 'trash') list = list.filter((n) => n.trashed)
    else if (view === 'label') {
      list = list.filter((n) => !n.trashed && !n.archived && n.labels.includes(activeLabel))
    }

    const query = debouncedSearch.trim().toLowerCase()
    if (query) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query) ||
          n.labels.some((l) => l.toLowerCase().includes(query)),
      )
    }

    return [...list].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [notes, view, activeLabel, debouncedSearch])

  const cardActions = {
    onUpdate: notesApi.updateNote,
    onDelete: notesApi.deleteNote,
    onRestore: notesApi.restoreNote,
    onPermanentDelete: notesApi.permanentDelete,
    onTogglePin: notesApi.togglePin,
    onToggleArchive: notesApi.toggleArchive,
    onSetColor: notesApi.setColor,
    onAddLabel: notesApi.addLabel,
    onRemoveLabel: notesApi.removeLabel,
    onCreateLabel: () => {},
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <Toolbar search={search} onSearchChange={setSearch} />
      <div className="flex flex-1">
        <Sidebar
          view={view}
          activeLabel={activeLabel}
          labels={labels}
          onSelectView={selectView}
          onSelectLabel={selectLabel}
          onRenameLabel={(oldLabel, newLabel) => notesApi.renameLabelEverywhere(oldLabel, newLabel)}
          onDeleteLabel={(label) => {
            notesApi.removeLabelEverywhere(label)
            if (view === 'label' && activeLabel === label) selectView('notes')
          }}
        />
        <main className="flex-1 px-4 py-6 sm:px-6">
          {view === 'notes' && (
            <NoteInput onAdd={notesApi.addNote} allLabels={labels} onCreateLabel={() => {}} />
          )}
          <NoteGrid
            notes={filteredNotes}
            view={debouncedSearch.trim() ? 'search' : view}
            allLabels={labels}
            actions={cardActions}
          />
        </main>
      </div>
    </div>
  )
}

export default App
