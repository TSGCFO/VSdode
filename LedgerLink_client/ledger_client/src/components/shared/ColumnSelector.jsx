// src/components/shared/ColumnSelector.jsx
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaSearch, FaTimes } from 'react-icons/fa';

const ColumnSelector = ({ columns, selectedColumns, onChange, onClose, columnGroups }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const selectorRef = useRef(null);

  useEffect(() => {
    // Focus search input when component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Handle click outside to close
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelectAll = (checked) => {
    if (checked) {
      onChange(Object.keys(columns));
    } else {
      // Keep at least one column selected
      onChange([Object.keys(columns)[0]]);
    }
  };

  const handleGroupSelect = (groupColumns, checked) => {
    if (checked) {
      const newColumns = [...new Set([...selectedColumns, ...groupColumns])];
      onChange(newColumns);
    } else {
      const remainingColumns = selectedColumns.filter(col => !groupColumns.includes(col));
      // Ensure at least one column remains selected
      onChange(remainingColumns.length > 0 ? remainingColumns : [Object.keys(columns)[0]]);
    }
  };

  const handleColumnToggle = (columnKey) => {
    if (selectedColumns.includes(columnKey)) {
      // Don't allow removing the last column
      if (selectedColumns.length === 1) return;
      onChange(selectedColumns.filter(key => key !== columnKey));
    } else {
      onChange([...selectedColumns, columnKey]);
    }
  };

  const isGroupSelected = (groupColumns) => {
    return groupColumns.every(col => selectedColumns.includes(col));
  };

  const isGroupPartiallySelected = (groupColumns) => {
    return groupColumns.some(col => selectedColumns.includes(col)) && 
           !groupColumns.every(col => selectedColumns.includes(col));
  };

  const filterColumns = (items) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return items.some(col => 
      columns[col].label.toLowerCase().includes(search) || 
      col.toLowerCase().includes(search)
    );
  };

  return (
    <div 
      ref={selectorRef}
      className="absolute z-10 mt-2 w-80 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 divide-y divide-gray-100"
    >
      <div className="sticky top-0 z-20 bg-white rounded-t-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FaTimes className="h-4 w-4 text-gray-400 hover:text-gray-500" />
              </button>
            )}
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <label className="flex items-center mt-3 px-2 py-1 hover:bg-gray-50 rounded">
            <input
              type="checkbox"
              checked={selectedColumns.length === Object.keys(columns).length}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-900">Select All Columns</span>
          </label>
        </div>
      </div>

      <div className="max-h-[calc(100vh-24rem)] overflow-y-auto">
        {Object.entries(columnGroups).map(([groupKey, group]) => (
          filterColumns(group.columns) && (
            <div key={groupKey} className="border-b border-gray-200 last:border-b-0">
              <div className="sticky top-0 z-10 bg-gray-50">
                <label className="flex items-center px-4 py-2">
                  <input
                    type="checkbox"
                    checked={isGroupSelected(group.columns)}
                    ref={input => {
                      if (input) {
                        input.indeterminate = isGroupPartiallySelected(group.columns);
                      }
                    }}
                    onChange={(e) => handleGroupSelect(group.columns, e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">{group.label}</span>
                </label>
              </div>
              <div className="py-1">
                {group.columns.map(columnKey => (
                  (!searchTerm || 
                   columns[columnKey].label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   columnKey.toLowerCase().includes(searchTerm.toLowerCase())) && (
                    <label key={columnKey} className="flex items-center px-8 py-1 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(columnKey)}
                        onChange={() => handleColumnToggle(columnKey)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{columns[columnKey].label}</span>
                    </label>
                  )
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      <div className="sticky bottom-0 z-20 bg-gray-50 p-4 rounded-b-lg border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {selectedColumns.length} of {Object.keys(columns).length} columns selected
          </span>
          <button
            onClick={onClose}
            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

ColumnSelector.propTypes = {
  columns: PropTypes.objectOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    sortKey: PropTypes.string.isRequired,
  })).isRequired,
  selectedColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  columnGroups: PropTypes.objectOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
};

export default ColumnSelector;
