import { useEffect, useRef, useState } from 'react'
import ColorPicker from './ColorPicker'
import LabelPicker from './LabelPicker'

const ICONS = {
  pin: (filled) => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M12 2l1.5 5.5L19 9l-5 3.5L15 19l-3-3.5L9 19l1-6.5L5 9l5.5-1.5z" strokeLinejoin="round" />
    </svg>
  ),
  archive: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
      <path d="M10 12h4" />
    </svg>
  ),
  unarchive: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
      <path d="M12 15V9M9 12l3-3 3 3" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M9 7V4h6v3m-8 0l1 13a2 2 0 002 2h4a2 2 0 002-2l1-13" />
    </svg>
  ),
  restore: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4v6h6M4 10a8 8 0 1 1 2.3 5.6" />
    </svg>
  ),
  color: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8.5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15.5" cy="12" r="1.2" fill="currentColor" />
    </svg>
  ),
  label: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.6 12.6L12 21.2 2.8 12 2.8 3.6 12 3.6z" strokeLinejoin="round" />
      <circle cx="7" cy="8" r="1.2" fill="currentColor" />
    </svg>
  ),
}

function IconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-full p-1.5 text-gray-600 hover:bg-black/5"
    >
      {children}
    </button>
  )
}

export default function NoteCard({
  note,
  allLabels,
  onUpdate,
  onDelete,
  onRestore,
  onPermanentDelete,
  onTogglePin,
  onToggleArchive,
  onSetColor,
  onAddLabel,
  onRemoveLabel,
  onCreateLabel,
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
  }, [note.title, note.content])

  function closeEdit() {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (trimmedTitle !== note.title || trimmedContent !== note.content) {
      onUpdate(note.id, { title: trimmedTitle, content: trimmedContent })
    }
    setEditing(false)
  }

  useEffect(() => {
    if (!editing) return
    function handleClick(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) closeEdit()
    }
    function handleKey(e) {
      if (e.key === 'Escape') closeEdit()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, title, content])

  const actionRow = (
    <div className="mt-2 flex flex-wrap items-center gap-0.5 opacity-100 transition-opacity focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
      <IconButton title={note.pinned ? 'Unpin' : 'Pin'} onClick={() => onTogglePin(note.id)}>
        {ICONS.pin(note.pinned)}
      </IconButton>
      {!note.trashed && (
        <>
          <div className="relative">
            <IconButton title="Change color" onClick={() => setShowColorPicker((s) => !s)}>
              {ICONS.color}
            </IconButton>
            {showColorPicker && (
              <ColorPicker
                current={note.color}
                onSelect={(color) => onSetColor(note.id, color)}
                onClose={() => setShowColorPicker(false)}
              />
            )}
          </div>
          <div className="relative">
            <IconButton title="Add label" onClick={() => setShowLabelPicker((s) => !s)}>
              {ICONS.label}
            </IconButton>
            {showLabelPicker && (
              <LabelPicker
                allLabels={allLabels}
                noteLabels={note.labels}
                onToggle={(label) =>
                  note.labels.includes(label) ? onRemoveLabel(note.id, label) : onAddLabel(note.id, label)
                }
                onCreate={(label) => {
                  onCreateLabel(label)
                  onAddLabel(note.id, label)
                }}
                onClose={() => setShowLabelPicker(false)}
              />
            )}
          </div>
          <IconButton title={note.archived ? 'Unarchive' : 'Archive'} onClick={() => onToggleArchive(note.id)}>
            {note.archived ? ICONS.unarchive : ICONS.archive}
          </IconButton>
          <IconButton title="Delete" onClick={() => onDelete(note.id)}>
            {ICONS.trash}
          </IconButton>
        </>
      )}
      {note.trashed && (
        <>
          <IconButton title="Restore" onClick={() => onRestore(note.id)}>
            {ICONS.restore}
          </IconButton>
          <IconButton title="Delete forever" onClick={() => onPermanentDelete(note.id)}>
            {ICONS.trash}
          </IconButton>
        </>
      )}
    </div>
  )

  return (
    <div
      ref={cardRef}
      className={`group mb-3 break-inside-avoid rounded-lg border border-gray-200 p-3 shadow-sm transition-shadow hover:shadow-md ${note.color}`}
    >
      {editing ? (
        <div>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent text-sm font-medium outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note..."
            rows={4}
            className="mt-1 w-full resize-none bg-transparent text-sm outline-none"
          />
        </div>
      ) : (
        <div
          onClick={() => !note.trashed && setEditing(true)}
          onKeyDown={(e) => {
            if (!note.trashed && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              setEditing(true)
            }
          }}
          role={note.trashed ? undefined : 'button'}
          tabIndex={note.trashed ? undefined : 0}
          className={note.trashed ? '' : 'cursor-pointer'}
        >
          {note.title && <h3 className="text-sm font-medium text-gray-900">{note.title}</h3>}
          {note.content && (
            <p className="mt-1 line-clamp-6 whitespace-pre-wrap text-sm text-gray-700">{note.content}</p>
          )}
        </div>
      )}

      {note.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.labels.map((l) => (
            <span key={l} className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-gray-600">
              {l}
            </span>
          ))}
        </div>
      )}

      {actionRow}
    </div>
  )
}
