import { useState } from 'react'

const NAV_ITEMS = [
  { key: 'notes', label: 'Notes' },
  { key: 'archive', label: 'Archive' },
  { key: 'trash', label: 'Trash' },
]

export default function Sidebar({
  view,
  activeLabel,
  labels,
  onSelectView,
  onSelectLabel,
  onRenameLabel,
  onDeleteLabel,
}) {
  const [menuLabel, setMenuLabel] = useState(null)

  return (
    <nav className="w-56 shrink-0 border-r border-gray-200 py-2">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelectView(item.key)}
          className={`flex w-full items-center rounded-r-full px-6 py-2 text-left text-sm ${
            view === item.key ? 'bg-yellow-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item.label}
        </button>
      ))}

      {labels.length > 0 && (
        <div className="mt-4">
          <p className="px-6 pb-1 text-xs font-medium tracking-wide text-gray-400">LABELS</p>
          {labels.map((label) => (
            <div key={label} className="group relative flex items-center">
              <button
                type="button"
                onClick={() => onSelectLabel(label)}
                className={`flex w-full items-center rounded-r-full px-6 py-2 text-left text-sm ${
                  view === 'label' && activeLabel === label
                    ? 'bg-yellow-100 font-medium text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{label}</span>
              </button>
              <button
                type="button"
                title="Label options"
                onClick={() => setMenuLabel(menuLabel === label ? null : label)}
                className="absolute right-2 rounded-full p-1 text-gray-500 opacity-0 hover:bg-gray-200 group-hover:opacity-100"
              >
                ⋮
              </button>
              {menuLabel === label && (
                <div className="absolute right-2 top-8 z-10 w-32 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    className="block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
                    onClick={() => {
                      const next = window.prompt('Rename label', label)
                      const trimmed = next?.trim()
                      if (trimmed && trimmed !== label) onRenameLabel(label, trimmed)
                      setMenuLabel(null)
                    }}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      onDeleteLabel(label)
                      setMenuLabel(null)
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}
