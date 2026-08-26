export default function Toolbar({ search, onSearchChange }) {
  return (
    <header className="flex items-center gap-4 border-b border-gray-200 px-4 py-3 sm:px-6">
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
