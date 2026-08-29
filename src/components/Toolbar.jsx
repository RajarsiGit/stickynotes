export default function Toolbar({ search, onSearchChange, onMenuClick }) {
  return (
    <header className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Toggle menu"
        className="-ml-2 shrink-0 rounded-full p-2 text-gray-600 hover:bg-gray-100 md:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="whitespace-nowrap text-lg font-medium text-gray-800">Sticky Notes</h1>
      <div className="max-w-md flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes..."
          className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm outline-none focus:bg-white focus:shadow"
        />
      </div>
    </header>
  )
}
