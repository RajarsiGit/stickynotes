import NoteCard from './NoteCard'

const EMPTY_MESSAGES = {
  notes: 'Notes you add will appear here',
  archive: 'No archived notes',
  trash: 'No notes in trash',
  label: 'No notes with this label',
  search: 'No matching notes found',
}

export default function NoteGrid({ notes, view, allLabels, actions }) {
  if (notes.length === 0) {
    return (
      <div className="mt-16 text-center text-gray-400">
        <p className="text-lg">{EMPTY_MESSAGES[view] ?? EMPTY_MESSAGES.notes}</p>
      </div>
    )
  }

  const pinned = notes.filter((n) => n.pinned)
  const unpinned = notes.filter((n) => !n.pinned)
  const showSections = view === 'notes' && pinned.length > 0

  function renderColumns(list) {
    return (
      <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
        {list.map((note) => (
          <NoteCard key={note.id} note={note} allLabels={allLabels} {...actions} />
        ))}
      </div>
    )
  }

  if (!showSections) {
    return renderColumns(notes)
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-wide text-gray-500">PINNED</p>
      {renderColumns(pinned)}
      {unpinned.length > 0 && (
        <>
          <p className="mb-2 mt-6 text-xs font-medium tracking-wide text-gray-500">OTHERS</p>
          {renderColumns(unpinned)}
        </>
      )}
    </div>
  )
}
