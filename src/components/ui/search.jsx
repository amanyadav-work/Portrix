import { SearchIcon, X } from "lucide-react"
import { useRef } from "react"

export default function SearchBox({ search, setSearch,placeholder,withCross }) {
  const inputRef = useRef(null)

  const handleClear = (e) => {
    e.stopPropagation()
    setSearch('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex items-center w-full max-w-sm border border-surface rounded-sm shadow-sm px-2 py-[4.4px] text-xs transition-colors ">
      <SearchIcon className="text-gray-400 transition-all  duration-300" size={15} />

      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="ml-2 w-full bg-transparent border-none text-xs focus:outline-none placeholder-gray-400"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {(search&& withCross) && (
        <X
          className="text-gray-400 hover:text-gray-500 cursor-pointer transition-colors"
          size={14}
          onClick={handleClear}
        />
      )}
    </div>
  )
}
