import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export function FileTree({ tree, onSelect, path = '', selectedFile }) {

  const entries = Object.entries(tree);

  const sortedEntries = entries.sort(([aKey, aVal], [bKey, bVal]) => {
    const aIsFile = aVal.__type === 'blob';
    const bIsFile = bVal.__type === 'blob';
    return aIsFile === bIsFile ? aKey.localeCompare(bKey) : aIsFile ? 1 : -1;
  });

  const handleSelect = (fullPath) => {
    onSelect(fullPath);
  };

  return (
    <ul className="text-sm text-gray-100 space-y-0.5">
      {sortedEntries.map(([name, value]) => {
        const fullPath = path ? `${path}/${name}` : name;
        const isFile = value.__type === 'blob';

        return isFile ? (
          <li
            key={fullPath}
            className="ml-4 relative before:absolute before:top-0 before:bottom-0 before:-left-2 before:border-l before:border-gray-200 dark:before:border-gray-600"
          >
            <div
              onClick={() => handleSelect(fullPath)}
              className={`cursor-pointer flex items-center gap-2 px-2 py-1 rounded-r-md
    ${selectedFile === fullPath
                && "bg-[#094771] text-white border-l-4 border-blue-500 shadow-sm"
                }
  `}
            >
              <FileText
                size={16}
                className={`flex-shrink-0 ${selectedFile === fullPath ? "text-white" : "text-gray-500 dark:text-gray-400"
                  }`}
              />
              <span className="select-none">{name}</span>
            </div>
          </li>
        ) : (
          <FolderItem
            key={fullPath}
            name={name}
            subtree={value}
            path={fullPath}
            onSelect={(p) => {
              onSelect(p);
            }}
            selectedFile={selectedFile}
          />
        );
      })}
    </ul>
  );
}

function FolderItem({ name, subtree, path, onSelect, selectedFile }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => setExpanded((v) => !v);

  return (
    <li
      className="relative ml-4 before:absolute before:top-0 before:bottom-0 before:-left-2 before:border-l before:border-gray-200 dark:before:border-gray-600"
    >
      <div
        onClick={toggle}
        className="cursor-pointer flex items-center gap-2 px-2 py-1 rounded-md select-none"
      >
        {expanded ? (
          <ChevronDown size={14} className="flex-shrink-0 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronRight size={14} className="flex-shrink-0 text-gray-600 dark:text-gray-400" />
        )}
        {expanded ? (
          <FolderOpen size={16} className="flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
        ) : (
          <Folder size={16} className="flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
        )}
        <span>{name}</span>
      </div>
      {expanded && (
        <div className="ml-4">
          <FileTree
            tree={subtree}
            onSelect={onSelect}
            path={path}
            selectedFile={selectedFile}
          />
        </div>
      )}
    </li>
  );
}
