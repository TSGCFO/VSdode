// src/features/products/Products.jsx
import ProductList from './components/ProductList';

const Products = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all products including their SKUs, descriptions, dimensions, and customer associations.
          </p>
        </div>
      </div>
      <ProductList />
    </div>
  );
};

export default Products;
