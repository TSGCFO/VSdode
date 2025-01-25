// src/features/products/components/ProductList.jsx
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../../../services/api';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import ProductForm from './ProductForm';
import ProductDetails from './ProductDetails';
import ProductFilter from './ProductFilter';
import ColumnSelector from '../../../components/shared/ColumnSelector';
import { FaSort, FaSortUp, FaSortDown, FaCog } from 'react-icons/fa';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

// Define all available columns
const ALL_COLUMNS = {
  sku: { label: 'SKU', sortKey: 'sku' },
  customer: { label: 'Customer', sortKey: 'customer__company_name' },
  labeling_unit_1: { label: 'Unit 1', sortKey: 'labeling_unit_1' },
  labeling_quantity_1: { label: 'Quantity 1', sortKey: 'labeling_quantity_1' },
  labeling_unit_2: { label: 'Unit 2', sortKey: 'labeling_unit_2' },
  labeling_quantity_2: { label: 'Quantity 2', sortKey: 'labeling_quantity_2' },
  labeling_unit_3: { label: 'Unit 3', sortKey: 'labeling_unit_3' },
  labeling_quantity_3: { label: 'Quantity 3', sortKey: 'labeling_quantity_3' },
  labeling_unit_4: { label: 'Unit 4', sortKey: 'labeling_unit_4' },
  labeling_quantity_4: { label: 'Quantity 4', sortKey: 'labeling_quantity_4' },
  labeling_unit_5: { label: 'Unit 5', sortKey: 'labeling_unit_5' },
  labeling_quantity_5: { label: 'Quantity 5', sortKey: 'labeling_quantity_5' },
  created_at: { label: 'Created At', sortKey: 'created_at' },
  updated_at: { label: 'Updated At', sortKey: 'updated_at' },
};

// Define column groups
const COLUMN_GROUPS = {
  basic: {
    label: 'Basic Information',
    columns: ['sku', 'customer'],
  },
  labeling: {
    label: 'Labeling Information',
    columns: [
      'labeling_unit_1', 'labeling_quantity_1',
      'labeling_unit_2', 'labeling_quantity_2',
      'labeling_unit_3', 'labeling_quantity_3',
      'labeling_unit_4', 'labeling_quantity_4',
      'labeling_unit_5', 'labeling_quantity_5',
    ],
  },
  timestamps: {
    label: 'Timestamps',
    columns: ['created_at', 'updated_at'],
  },
};

// Default visible columns
const DEFAULT_VISIBLE_COLUMNS = [
  'sku',
  'customer',
  'labeling_unit_1',
  'labeling_quantity_1',
  'created_at',
];

const SortIcon = ({ field, sortField, sortOrder }) => {
  if (sortField !== field) {
    return <FaSort className="ml-1 inline-block" />;
  }
  return sortOrder === 'asc' ? (
    <FaSortUp className="ml-1 inline-block" />
  ) : (
    <FaSortDown className="ml-1 inline-block" />
  );
};

SortIcon.propTypes = {
  field: PropTypes.string.isRequired,
  sortField: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
};

const LabelingCell = ({ unit, quantity }) => {
  if (!unit && !quantity) return null;
  return (
    <div className="flex flex-col">
      <span>{unit}</span>
      {quantity !== null && (
        <span className="text-xs text-gray-500">Qty: {quantity}</span>
      )}
    </div>
  );
};

LabelingCell.propTypes = {
  unit: PropTypes.string,
  quantity: PropTypes.number,
};

const ProductList = () => {
  const [sortField, setSortField] = useState('sku');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    customer: '',
    created_after: '',
    created_before: '',
    updated_after: '',
    updated_before: '',
    labeling_unit: '',
    min_quantity: '',
    max_quantity: '',
    unit_number: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useLocalStorage('productListColumns', DEFAULT_VISIBLE_COLUMNS);
  const queryClient = useQueryClient();

  // Combine search, sort, and filter parameters
  const queryParams = useMemo(() => ({
    page: pageIndex,
    search: searchTerm,
    ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
    ...filters,
  }), [pageIndex, searchTerm, sortField, sortOrder, filters]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productApi.getProducts(queryParams),
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    },
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPageIndex(1);
    }, 300),
    []
  );

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPageIndex(1);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct.id);
    }
  };

  const handleExport = () => {
    const headers = visibleColumns.map(key => ALL_COLUMNS[key].label);
    const csvData = data?.results?.map(product => 
      visibleColumns.map(key => {
        if (key === 'customer') return product.customer_details?.company_name || '';
        if (key.startsWith('created_at') || key.startsWith('updated_at')) {
          return product[key] ? new Date(product[key]).toLocaleString() : '';
        }
        return product[key] || '';
      })
    );

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-red-500">Error loading products</div>
      </div>
    );
  }

  const renderCellContent = (product, columnKey) => {
    switch (columnKey) {
      case 'sku':
        return (
          <button
            onClick={() => setSelectedProductForDetails(product.id)}
            className="text-indigo-600 hover:underline text-left"
          >
            {product.sku}
          </button>
        );
      case 'customer':
        return product.customer_details?.company_name || 'N/A';
      case 'created_at':
      case 'updated_at':
        return product[columnKey] ? new Date(product[columnKey]).toLocaleString() : 'N/A';
      case 'labeling_unit_1':
      case 'labeling_unit_2':
      case 'labeling_unit_3':
      case 'labeling_unit_4':
      case 'labeling_unit_5': {
        const index = columnKey.slice(-1);
        return (
          <LabelingCell
            unit={product[`labeling_unit_${index}`]}
            quantity={product[`labeling_quantity_${index}`]}
          />
        );
      }
      case 'labeling_quantity_1':
      case 'labeling_quantity_2':
      case 'labeling_quantity_3':
      case 'labeling_quantity_4':
      case 'labeling_quantity_5':
        return null; // Quantities are shown in the unit cells
      default:
        return product[columnKey];
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between mb-4">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search products..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Filters
          </button>
          <div className="relative">
            <button
              onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaCog className="mr-2" />
              Columns
            </button>
            {isColumnSelectorOpen && (
              <ColumnSelector
                columns={ALL_COLUMNS}
                selectedColumns={visibleColumns}
                onChange={setVisibleColumns}
                onClose={() => setIsColumnSelectorOpen(false)}
                columnGroups={COLUMN_GROUPS}
              />
            )}
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Export
          </button>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add product
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col relative">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-25 flex items-center justify-center">
            <div className="text-gray-500">Updating...</div>
          </div>
        )}

        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {visibleColumns.map(columnKey => (
                      <th
                        key={columnKey}
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort(ALL_COLUMNS[columnKey].sortKey)}
                      >
                        <div className="flex items-center">
                          {ALL_COLUMNS[columnKey].label}
                          <SortIcon
                            field={ALL_COLUMNS[columnKey].sortKey}
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </div>
                      </th>
                    ))}
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data?.results?.map((product) => (
                    <tr key={product.id}>
                      {visibleColumns.map(columnKey => (
                        <td key={columnKey} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {renderCellContent(product, columnKey)}
                        </td>
                      ))}
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex justify-between sm:hidden">
          <button
            onClick={() => setPageIndex(prev => Math.max(prev - 1, 1))}
            disabled={pageIndex === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPageIndex(prev => prev + 1)}
            disabled={!data?.next}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {data?.count ? (pageIndex - 1) * 10 + 1 : 0}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(pageIndex * 10, data?.count || 0)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{data?.count || 0}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setPageIndex(prev => Math.max(prev - 1, 1))}
                disabled={pageIndex === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                Previous
              </button>
              <button
                onClick={() => setPageIndex(prev => prev + 1)}
                disabled={!data?.next}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <ProductForm
          product={selectedProduct}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete {selectedProduct?.sku}? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProductForDetails && (
        <ProductDetails
          productId={selectedProductForDetails}
          onClose={() => setSelectedProductForDetails(null)}
          onEdit={(product) => {
            setSelectedProduct(product);
            setIsFormOpen(true);
          }}
        />
      )}

      {isFilterOpen && (
        <ProductFilter
          filters={filters}
          onApply={handleFilterChange}
          onClose={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductList;
