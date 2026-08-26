export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-gray-200 border-t-yellow-400" />
        <svg viewBox="0 0 64 64" className="h-8 w-8 animate-pulse" aria-hidden="true">
          <path d="M10 6h34l10 10v32a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z" fill="#fde047" />
          <path d="M44 6l10 10H48a4 4 0 0 1-4-4V6z" fill="#facc15" />
          <rect x="14" y="24" width="26" height="4" rx="2" fill="#a16207" opacity="0.55" />
          <rect x="14" y="33" width="20" height="4" rx="2" fill="#a16207" opacity="0.55" />
        </svg>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}
