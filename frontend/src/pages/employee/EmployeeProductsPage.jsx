import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon,
  LinkIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EmployeeProductsPage = () => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadMethod, setUploadMethod] = useState('url');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [categories, setCategories] = useState([
    'dresses', 'handbags', 'shoes', 'jewellery', 'accessories', 
    'beauty', 'skincare', 'makeup', 'perfume', 'hair', 'body'
  ]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    priceLSL: '',
    priceZAR: '',
    category: '',
    stock: '',
    sizes: [],
    colors: [],
    images: []
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    loadCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = () => {
    const savedCategories = localStorage.getItem('product_categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  };

  const saveCategories = (newCategories) => {
    localStorage.setItem('product_categories', JSON.stringify(newCategories));
    setCategories(newCategories);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    const categoryExists = categories.some(cat => 
      cat.toLowerCase() === newCategory.toLowerCase().trim()
    );

    if (categoryExists) {
      toast.error('Category already exists');
      return;
    }

    const updatedCategories = [...categories, newCategory.toLowerCase().trim()];
    saveCategories(updatedCategories);
    setFormData({ ...formData, category: newCategory.toLowerCase().trim() });
    setShowCategoryModal(false);
    setNewCategory('');
    toast.success(`Category "${newCategory}" added successfully`);
  };

  // Size Management
  const handleAddSize = () => {
    if (!newSize.trim()) {
      toast.error('Please enter a size');
      return;
    }

    const sizeExists = formData.sizes.some(s => 
      s.toLowerCase() === newSize.toLowerCase().trim()
    );

    if (sizeExists) {
      toast.error('Size already exists');
      return;
    }

    setFormData({
      ...formData,
      sizes: [...formData.sizes, newSize.trim().toUpperCase()]
    });
    setNewSize('');
    toast.success(`Size "${newSize}" added`);
  };

  const handleRemoveSize = (indexToRemove) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, index) => index !== indexToRemove)
    });
  };

  // Color Management
  const handleAddColor = () => {
    if (!newColor.trim()) {
      toast.error('Please enter a color');
      return;
    }

    const colorExists = formData.colors.some(c => 
      c.toLowerCase() === newColor.toLowerCase().trim()
    );

    if (colorExists) {
      toast.error('Color already exists');
      return;
    }

    setFormData({
      ...formData,
      colors: [...formData.colors, newColor.trim()]
    });
    setNewColor('');
    toast.success(`Color "${newColor}" added`);
  };

  const handleRemoveColor = (indexToRemove) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, index) => index !== indexToRemove)
    });
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    if (data.success) {
      return data.url;
    } else {
      throw new Error(data.message || 'Upload failed');
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    const uploadedUrls = [];
    
    for (const file of files) {
      try {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
        toast.success(`Uploaded: ${file.name}`);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload: ${file.name}`);
      }
    }
    
    if (uploadedUrls.length > 0) {
      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedUrls]
      });
    }
    
    setUploading(false);
    e.target.value = '';
  };

  const addImageUrl = () => {
    if (imageUrlInput && imageUrlInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrlInput.trim()]
      });
      setImageUrlInput('');
      toast.success('Image URL added');
    } else {
      toast.error('Please enter a valid URL');
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/admin/products/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          toast.success('Product deleted successfully');
          fetchProducts();
        } else {
          toast.error(data.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const url = editingProduct 
        ? `${import.meta.env.VITE_API_URL}/api/products/admin/products/${editingProduct.id}`
        : `${import.meta.env.VITE_API_URL}/api/products/admin/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          priceLSL: parseFloat(formData.priceLSL || formData.price),
          priceZAR: parseFloat(formData.priceZAR || formData.price),
          stock: parseInt(formData.stock)
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(editingProduct ? 'Product updated' : 'Product created');
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
          name: '', description: '', price: '', priceLSL: '', priceZAR: '',
          category: '', stock: '', sizes: [], colors: [], images: []
        });
        setNewSize('');
        setNewColor('');
        setImageUrlInput('');
        fetchProducts();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      priceLSL: product.priceLSL || '',
      priceZAR: product.priceZAR || '',
      category: product.category || '',
      stock: product.stock || '',
      sizes: product.sizes || [],
      colors: product.colors || [],
      images: product.images || []
    });
    setNewSize('');
    setNewColor('');
    setImageUrlInput('');
    setShowModal(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum">Manage Products</h1>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={fetchProducts}
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: '', description: '', price: '', priceLSL: '', priceZAR: '',
                  category: '', stock: '', sizes: [], colors: [], images: []
                });
                setNewSize('');
                setNewColor('');
                setImageUrlInput('');
                setShowModal(true);
              }}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-secondary transition text-sm"
            >
              <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs sm:text-sm">
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Image</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden sm:table-cell">Category</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 hidden md:table-cell">Price</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Stock</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <img 
                        src={product.images?.[0] || 'https://via.placeholder.com/40'} 
                        alt={product.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium">
                      <div>
                        {product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name}
                        <div className="text-[10px] sm:hidden text-gray-500 mt-0.5">{product.category}</div>
                        <div className="text-[10px] sm:hidden text-primary mt-0.5">LSL {product.priceLSL || product.price}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{product.category}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-primary hidden md:table-cell">LSL {product.priceLSL || product.price}</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                      <span className={`${product.stock < 10 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <div className="flex space-x-1.5 sm:space-x-2">
                        <Link 
                          to={`/product/${product.id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 transition p-0.5"
                          title="View Product"
                        >
                          <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-green-600 hover:text-green-800 transition p-0.5"
                          title="Edit Product"
                        >
                          <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-red-600 hover:text-red-800 transition p-0.5"
                          title="Delete Product"
                        >
                          <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="px-2 sm:px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-1 text-sm"
                      title="Add New Category"
                    >
                      <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Price (LSL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              
              {/* Sizes Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Sizes</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Enter size (e.g., S, M, L, XL)"
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSize()}
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition flex items-center justify-center gap-1 text-sm"
                  >
                    <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Add
                  </button>
                </div>
                {formData.sizes.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.sizes.map((size, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 rounded-full text-xs sm:text-sm"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(idx)}
                          className="text-red-500 hover:text-red-700 ml-0.5 sm:ml-1"
                        >
                          <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-400 italic">No sizes added yet</p>
                )}
              </div>
              
              {/* Colors Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Colors</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Enter color (e.g., Black, Red, Blue)"
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddColor()}
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition flex items-center justify-center gap-1 text-sm"
                  >
                    <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Add
                  </button>
                </div>
                {formData.colors.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.colors.map((color, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 rounded-full text-xs sm:text-sm"
                      >
                        <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: color.toLowerCase() }}></span>
                        {color}
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="text-red-500 hover:text-red-700 ml-0.5 sm:ml-1"
                        >
                          <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-400 italic">No colors added yet</p>
                )}
              </div>
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                
                {formData.images.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs text-gray-500 mb-2">Images ({formData.images.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`product ${idx}`} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border rounded-lg p-3 sm:p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('url')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                        uploadMethod === 'url' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
                      Add URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('file')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                        uploadMethod === 'file' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <PhotoIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
                      Upload File
                    </button>
                  </div>
                  
                  {uploadMethod === 'url' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition text-sm"
                      >
                        Add
                      </button>
                    </div>
                  )}
                  
                  {uploadMethod === 'file' && (
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        multiple
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id="fileUpload"
                      />
                      <label
                        htmlFor="fileUpload"
                        className="cursor-pointer inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition text-sm"
                      >
                        <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{uploading ? 'Uploading...' : 'Choose Images'}</span>
                      </label>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                        Supports JPG, PNG, GIF, WebP (Max 5MB each)
                      </p>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="text-center text-sm text-primary">
                      <div className="animate-spin inline-block w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                      Uploading images...
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="submit" disabled={submitting || uploading} className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 text-sm">
                  {submitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Add New Category</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Category Name</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Sunglasses, Watches, Scarves"
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                autoFocus
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                Category name will be saved in lowercase
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddCategory}
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-secondary transition text-sm"
              >
                Add Category
              </button>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProductsPage;