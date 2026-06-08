import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  PhotoIcon,
  XMarkIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CalendarIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EmployeeBannersPage = () => {
  const { user, token } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    position: 'home_hero',
    order: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  // Get image dimensions and optimize
  const getImageDimensions = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  };

  // Optimize image URL with Cloudinary transformations
  const optimizeImageUrl = (url, width, height, position) => {
    if (!url) return url;
    
    // If it's a Cloudinary URL, add transformations
    if (url.includes('cloudinary.com')) {
      // Determine optimal dimensions based on banner position
      let targetWidth = 1200;
      let targetHeight = 400;
      
      switch(position) {
        case 'home_hero':
          targetWidth = 1920;
          targetHeight = 600;
          break;
        case 'home_category':
          targetWidth = 800;
          targetHeight = 400;
          break;
        case 'sidebar':
          targetWidth = 400;
          targetHeight = 300;
          break;
        default:
          targetWidth = 1200;
          targetHeight = 400;
      }
      
      // Add Cloudinary transformations
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/c_fill,w_${targetWidth},h_${targetHeight},q_auto,f_auto/${parts[1]}`;
      }
    }
    
    return url;
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      // Compress image before upload if too large
      let fileToUpload = file;
      if (file.size > 2 * 1024 * 1024) { // If image > 2MB, compress
        fileToUpload = await compressImage(file);
      }
      
      const formData = new FormData();
      formData.append('image', fileToUpload);
      
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
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Compress image before upload
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 1920;
          const maxHeight = 1080;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Please select an image under 5MB');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // Get dimensions
    const dimensions = await getImageDimensions(previewUrl);
    setImageDimensions(dimensions);
    
    // Upload
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setFormData({ ...formData, image: imageUrl });
      toast.success(`Image uploaded successfully (${dimensions.width} x ${dimensions.height})`);
    }
  };

  const handleUrlInput = async (e) => {
    const url = e.target.value;
    setFormData({ ...formData, image: url });
    
    if (url && (url.startsWith('http') || url.startsWith('https'))) {
      setImagePreview(url);
      const dimensions = await getImageDimensions(url);
      setImageDimensions(dimensions);
      if (dimensions.width > 0) {
        toast.success(`Image loaded: ${dimensions.width} x ${dimensions.height}`);
      }
    } else {
      setImagePreview('');
      setImageDimensions({ width: 0, height: 0 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const url = editingBanner 
        ? `${import.meta.env.VITE_API_URL}/api/banners/${editingBanner.id}`
        : `${import.meta.env.VITE_API_URL}/api/banners`;
      
      const method = editingBanner ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          subtitle: formData.subtitle,
          image: formData.image,
          link: formData.link,
          position: formData.position,
          order: parseInt(formData.order) || banners.length + 1,
          isActive: formData.isActive,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully');
        setShowModal(false);
        resetForm();
        fetchBanners();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (bannerId, bannerTitle) => {
    if (window.confirm(`Are you sure you want to delete "${bannerTitle}"?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banners/${bannerId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          toast.success('Banner deleted successfully');
          fetchBanners();
        } else {
          toast.error(data.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Error deleting banner:', error);
        toast.error('Failed to delete banner');
      }
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      link: banner.link || '',
      position: banner.position,
      order: banner.order,
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : ''
    });
    setImagePreview(banner.image);
    // Get dimensions of existing image
    getImageDimensions(banner.image).then(dims => setImageDimensions(dims));
    setShowModal(true);
  };

  const handleToggleStatus = async (bannerId, currentStatus) => {
    const banner = banners.find(b => b.id === bannerId);
    if (!banner) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banners/${bannerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...banner,
          isActive: !currentStatus
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Banner ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchBanners();
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast.error('Failed to update banner status');
    }
  };

  const handleCopyLink = (link) => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!');
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      link: '',
      position: 'home_hero',
      order: 0,
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setImagePreview('');
    setImageDimensions({ width: 0, height: 0 });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString();
  };

  const getPositionBadge = (position) => {
    switch(position) {
      case 'home_hero': return 'bg-purple-100 text-purple-800';
      case 'home_category': return 'bg-blue-100 text-blue-800';
      case 'sidebar': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionLabel = (position) => {
    switch(position) {
      case 'home_hero': return 'Hero Banner';
      case 'home_category': return 'Category Banner';
      case 'sidebar': return 'Sidebar Banner';
      default: return position;
    }
  };

  const filteredBanners = banners.filter(banner => {
    const matchesPosition = filterPosition === 'all' || banner.position === filterPosition;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && banner.isActive) ||
      (filterStatus === 'inactive' && !banner.isActive);
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (banner.subtitle && banner.subtitle.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesPosition && matchesStatus && matchesSearch;
  });

  const stats = {
    total: banners.length,
    active: banners.filter(b => b.isActive).length,
    inactive: banners.filter(b => !b.isActive).length,
    hero: banners.filter(b => b.position === 'home_hero').length,
    category: banners.filter(b => b.position === 'home_category').length,
    sidebar: banners.filter(b => b.position === 'sidebar').length
  };

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
          <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-darkPlum">Manage Banners</h1>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={fetchBanners}
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-secondary transition text-sm"
            >
              <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Add Banner</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-sm">Total</p>
            <p className="text-lg sm:text-2xl font-bold text-darkPlum">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-sm">Active</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-sm">Inactive</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.inactive}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-sm">Hero</p>
            <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.hero}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-sm">Category</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.category}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-sm">Sidebar</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.sidebar}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search banners by title or subtitle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="all">All Positions</option>
            <option value="home_hero">Hero Banner</option>
            <option value="home_category">Category Banner</option>
            <option value="sidebar">Sidebar Banner</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="relative h-40 sm:h-48 bg-gray-100">
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="w-full h-40 sm:h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handleToggleStatus(banner.id, banner.isActive)}
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-xs font-semibold ${
                      banner.isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-xs font-semibold ${getPositionBadge(banner.position)}`}>
                    {getPositionLabel(banner.position)}
                  </span>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-xs sm:text-sm text-gray-500">{banner.subtitle}</p>
                    )}
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                      Order: {banner.order}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                      <CalendarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      Valid: {formatDate(banner.startDate)} - {formatDate(banner.endDate)}
                    </p>
                  </div>
                  <div className="flex space-x-1.5 sm:space-x-2">
                    {banner.link && (
                      <button
                        onClick={() => handleCopyLink(banner.link)}
                        className="text-gray-600 hover:text-primary transition p-1"
                        title="Copy Link"
                      >
                        <ClipboardDocumentIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(banner)}
                      className="text-green-600 hover:text-green-800 transition p-1"
                      title="Edit Banner"
                    >
                      <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id, banner.title)}
                      className="text-red-600 hover:text-red-800 transition p-1"
                      title="Delete Banner"
                    >
                      <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
                {banner.link && (
                  <a 
                    href={banner.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary text-xs sm:text-sm hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    View Link →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredBanners.length === 0 && (
          <div className="text-center py-10 sm:py-16 bg-white rounded-xl">
            <PhotoIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-sm">No banners found. Click "Add Banner" to create one.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Summer Sale"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  placeholder="e.g., Up to 50% off"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Banner Image *</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={handleUrlInput}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageSelect}
                      disabled={uploading}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="cursor-pointer inline-flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm w-full sm:w-auto"
                    >
                      <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                    </label>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mt-1">
                  <p className="text-[10px] sm:text-xs text-gray-400">Supports JPG, PNG, GIF, WebP (Max 5MB)</p>
                  {imageDimensions.width > 0 && (
                    <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                      <ArrowsPointingOutIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {imageDimensions.width} x {imageDimensions.height}
                    </p>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full max-h-40 sm:max-h-48 object-contain rounded-lg border bg-gray-50"
                        onLoad={async (e) => {
                          const dims = await getImageDimensions(imagePreview);
                          setImageDimensions(dims);
                        }}
                      />
                      {imageDimensions.width > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                          {imageDimensions.width} × {imageDimensions.height}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Link (URL)</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  placeholder="/products or https://..."
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Where users go when they click the banner</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="home_hero">Hero Banner (1920 x 600)</option>
                    <option value="home_category">Category Banner (800 x 400)</option>
                    <option value="sidebar">Sidebar Banner (400 x 300)</option>
                  </select>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                    {formData.position === 'home_hero' && 'Appears at top of homepage as carousel'}
                    {formData.position === 'home_category' && 'Appears between sections on homepage'}
                    {formData.position === 'sidebar' && 'Appears in sidebar on homepage'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Lower numbers appear first</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Leave empty to start immediately</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Leave empty for no expiry</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary"
                />
                <label className="text-xs sm:text-sm font-medium">Active (Banner will be visible on homepage)</label>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="submit" disabled={submitting || uploading} className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-secondary transition disabled:opacity-50 text-sm">
                  {submitting ? 'Saving...' : (editingBanner ? 'Update Banner' : 'Create Banner')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeBannersPage;