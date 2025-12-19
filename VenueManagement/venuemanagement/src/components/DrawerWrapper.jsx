import { X } from 'lucide-react'

export default function DrawerWrapper({ open, onClose, title = '', children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/10 backdrop-blur-sm">
      <div className="w-full max-w-xl h-full bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 hover:text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
