// pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Image as ImageIcon,
  X,
  Upload,
  Loader2,
  Save
} from 'lucide-react';

const API_BASE = 'http://localhost:3001';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [editingProductId, setEditingProductId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'RO',
    price: '',
    stock: '',
    image: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/products`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data);
      setError('');
    } catch (err) {
      setError('Failed to load products. Please check if json-server is running.');
      console.error('Products fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Add Modal
  const handleAddClick = () => {
    resetForm();
    setModalType('add');
    setShowModal(true);
  };

  // Open Edit Modal
  const handleEditClick = (product) => {
    setFormData({
      name: product.name || '',
      category: product.category || 'RO',
      price: product.price || '',
      stock: product.stock || '',
      image: product.image || '',
      description: product.description || ''
    });
    setEditingProductId(product.id);
    setModalType('edit');
    setShowModal(true);
  };

  // Submit Form (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim() || !formData.price || !formData.stock) {
      setFormError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image: formData.image || '',
        description: formData.description
      };

      let response;
      
      if (modalType === 'add') {
        // Add new product
        response = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      } else {
        // Update existing product
        response = await fetch(`${API_BASE}/products/${editingProductId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${modalType} product`);
      }

      const resultProduct = await response.json();
      
      // Update local state
      if (modalType === 'add') {
        setProducts([...products, resultProduct]);
      } else {
        setProducts(products.map(p => 
          p.id === editingProductId ? resultProduct : p
        ));
      }
      
      // Close modal and reset
      resetForm();
      setShowModal(false);
      alert(`Product ${modalType === 'add' ? 'added' : 'updated'} successfully!`);
      
    } catch (err) {
      setFormError(`Failed to ${modalType} product. Please try again.`);
      console.error(`${modalType} product error:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Remove from local state
      setProducts(products.filter(product => product.id !== id));
      alert('Product deleted successfully!');
    } catch (err) {
      alert('Failed to delete product');
      console.error('Delete error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'RO',
      price: '',
      stock: '',
      image: '',
      description: ''
    });
    setEditingProductId(null);
    setFormError('');
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Image component with better error handling
  const ProductImage = ({ src, alt, className }) => {
    const [imgError, setImgError] = useState(false);
    
    if (imgError || !src || !isValidImageUrl(src)) {
      return (
        <div className={`${className} bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center`}>
          <ImageIcon className="w-6 h-6 text-slate-400" />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  };

  // Check if image URL is valid
  const isValidImageUrl = (url) => {
    if (!url) return false;
    // Accept any URL for now, let the browser handle it
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formError) setFormError('');
  };

  // Get modal title
  const getModalTitle = () => {
    return modalType === 'add' ? 'Add New Product' : 'Edit Product';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A9FF]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Products Management</h2>
            <p className="text-slate-600 mt-1">
              Total Products: {products.length} | Showing: {filteredProducts.length}
            </p>
          </div>
          <button 
            onClick={handleAddClick}
            className="inline-flex items-center px-4 py-3 bg-[#00A9FF] text-white font-medium rounded-lg hover:bg-[#0088CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A9FF] transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent transition-all"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent appearance-none bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">⚠️</div>
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <p className="text-red-700 text-sm mt-1">
                Make sure json-server is running on http://localhost:3001
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#00A9FF] to-[#89CFF3]">
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Product</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Category</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Price</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Stock</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr 
                  key={product.id} 
                  className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-[#A0E9FF]/20 hover:to-[#89CFF3]/20 transition-all duration-200 group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-lg mr-4">
                        <ProductImage 
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full rounded-lg object-cover border-2 border-slate-200 group-hover:border-[#00A9FF] transition-all duration-300"
                        />
                      </div>
                      <div className="relative">
                        <p className="text-sm font-medium text-slate-800 group-hover:text-[#00A9FF] transition-colors">
                          {product.name || 'Unnamed Product'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {product.description || 'No description available'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">ID: #{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium group-hover:bg-[#00A9FF] group-hover:text-white transition-all duration-300">
                      {product.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-slate-800 group-hover:text-[#00A9FF] transition-colors">
                        ₹{product.price?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                        (product.stock || 0) > 20 
                          ? 'bg-green-100 text-green-800 group-hover:bg-green-600 group-hover:text-white' 
                          : (product.stock || 0) > 5 
                          ? 'bg-yellow-100 text-yellow-800 group-hover:bg-yellow-600 group-hover:text-white'
                          : 'bg-red-100 text-red-800 group-hover:bg-red-600 group-hover:text-white'
                      }`}>
                        <span className="inline-block w-2 h-2 rounded-full mr-2 bg-current opacity-60"></span>
                        {product.stock || 0} units
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="inline-flex items-center p-2 text-[#00A9FF] hover:bg-[#00A9FF]/10 rounded-lg transition-all duration-300 hover:scale-110 group/edit"
                        title="Edit Product"
                      >
                        <Edit2 size={16} className="group-hover/edit:rotate-12 transition-transform" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110 group/delete"
                        title="Delete Product"
                      >
                        <Trash2 size={16} className="group-hover/delete:shake-animation" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && !error && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
              <Package size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No products found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No products available. Add your first product!'}
            </p>
            <button 
              onClick={handleAddClick}
              className="inline-flex items-center px-4 py-2 bg-[#00A9FF] text-white rounded-lg hover:bg-[#0088CC] transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} className="mr-2" />
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{getModalTitle()}</h3>
                <p className="text-slate-600 text-sm mt-1">
                  {modalType === 'add' 
                    ? 'Fill in the details to add a new product' 
                    : 'Update the product details'}
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{formError}</p>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent transition-all"
                  placeholder="Enter product name"
                />
              </div>

              {/* Category and Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent transition-all"
                  >
                    <option value="RO">RO System</option>
                    <option value="UV">UV Purifier</option>
                    <option value="Gravity">Gravity Filter</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent transition-all"
                    placeholder="Enter price"
                  />
                </div>
              </div>

              {/* Stock and Image Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent transition-all"
                    placeholder="Enter stock quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Image URL (Optional)
                  </label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {formData.image && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 mb-1">Image Preview:</p>
                      <div className="w-20 h-20">
                        <ProductImage 
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full rounded-lg object-cover border border-slate-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent transition-all resize-none"
                  placeholder="Enter product description"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all active:scale-95"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#00A9FF] text-white font-medium rounded-lg hover:bg-[#0088CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A9FF] transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      {modalType === 'add' ? 'Adding...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      {modalType === 'add' ? (
                        <>
                          <Plus size={20} className="mr-2" />
                          Add Product
                        </>
                      ) : (
                        <>
                          <Save size={20} className="mr-2" />
                          Update Product
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;