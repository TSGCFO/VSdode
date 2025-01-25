// src/features/products/components/ProductDetails.jsx
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../../services/api';
import PropTypes from 'prop-types';

const LabelingSet = ({ index, unit, quantity }) => {
  if (!unit && !quantity) return null;
  return (
    <div className="border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
      <h4 className="text-sm font-medium text-gray-900">Labeling Set {index}</h4>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-medium text-gray-500">Unit</span>
          <p className="mt-1 text-sm text-gray-900">{unit || 'N/A'}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Quantity</span>
          <p className="mt-1 text-sm text-gray-900">{quantity || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

LabelingSet.propTypes = {
  index: PropTypes.number.isRequired,
  unit: PropTypes.string,
  quantity: PropTypes.number,
};

const ProductDetails = ({ productId, onClose, onEdit }) => {
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['products', productId],
    queryFn: () => productApi.getProductById(productId),
  });

  const handleEdit = () => {
    onEdit(product);
    onClose();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
          <div className="text-center">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
          <div className="text-center text-red-600">Error loading product details</div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="border-t border-gray-200">
          <div className="divide-y divide-gray-200">
            <div className="py-4 grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-gray-500">SKU</div>
              <div className="col-span-2 text-sm text-gray-900">
                {product.sku}
              </div>
            </div>

            <div className="py-4 grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-gray-500">Customer</div>
              <div className="col-span-2 text-sm text-gray-900">
                {product.customer_details?.company_name || 'N/A'}
              </div>
            </div>

            <div className="py-4">
              <div className="text-sm font-medium text-gray-500 mb-4">Labeling Information</div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <LabelingSet
                    key={index}
                    index={index}
                    unit={product[`labeling_unit_${index}`]}
                    quantity={product[`labeling_quantity_${index}`]}
                  />
                ))}
              </div>
            </div>

            <div className="py-4 grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-gray-500">Created At</div>
              <div className="col-span-2 text-sm text-gray-900">
                {new Date(product.created_at).toLocaleString()}
              </div>
            </div>

            <div className="py-4 grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-gray-500">Last Updated</div>
              <div className="col-span-2 text-sm text-gray-900">
                {new Date(product.updated_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleEdit}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit Product
          </button>
          <button
            onClick={onClose}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

ProductDetails.propTypes = {
  productId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default ProductDetails;
