import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Cog6ToothIcon,
  CreditCardIcon,
  TruckIcon,
  BellIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  TagIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminSettingsPage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    storeName: 'My Secret Drawer',
    storeEmail: 'hello@mysecretdrawer.com',
    storePhone: '+266 1234 5678',
    storeAddress: 'Maseru, Lesotho',
    currency: 'LSL',
    taxRate: 15,
    lowStockAlert: 10,
    orderConfirmation: true,
    paymentReceived: true,
    orderShipped: true,
    orderDelivered: true
  });

  const [paymentGateways, setPaymentGateways] = useState([
    { id: 'payfast', name: 'PayFast', enabled: true, apiKey: '••••••••', secretKey: '••••••••' },
    { id: 'yoco', name: 'Yoco', enabled: true, apiKey: '••••••••', secretKey: '••••••••' },
    { id: 'ozow', name: 'Ozow', enabled: false, apiKey: '', secretKey: '' },
    { id: 'cod', name: 'Cash on Delivery', enabled: true, apiKey: '', secretKey: '' }
  ]);

  const [deliveryZones, setDeliveryZones] = useState([
    { id: 1, name: 'Maseru', fee: 50, estimatedDays: '1-2 days', enabled: true },
    { id: 2, name: 'Leribe', fee: 80, estimatedDays: '2-3 days', enabled: true },
    { id: 3, name: 'Berea', fee: 70, estimatedDays: '2-3 days', enabled: true },
    { id: 4, name: 'Mafeteng', fee: 90, estimatedDays: '3-4 days', enabled: true },
    { id: 5, name: 'Mohale\'s Hoek', fee: 100, estimatedDays: '3-4 days', enabled: true },
    { id: 6, name: 'South Africa', fee: 250, estimatedDays: '5-7 days', enabled: true }
  ]);

  const [newZone, setNewZone] = useState({ name: '', fee: '', estimatedDays: '', enabled: true });
  const [showAddZone, setShowAddZone] = useState(false);
  const [editingZone, setEditingZone] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        if (data.settings) setSettings(data.settings);
        if (data.paymentGateways) setPaymentGateways(data.paymentGateways);
        if (data.deliveryZones) setDeliveryZones(data.deliveryZones);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      const savedSettings = localStorage.getItem('admin_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.paymentGateways) setPaymentGateways(parsed.paymentGateways);
        if (parsed.deliveryZones) setDeliveryZones(parsed.deliveryZones);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings, paymentGateways, deliveryZones })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Settings saved successfully');
        localStorage.setItem('admin_settings', JSON.stringify({ settings, paymentGateways, deliveryZones }));
      } else {
        localStorage.setItem('admin_settings', JSON.stringify({ settings, paymentGateways, deliveryZones }));
        toast.success('Settings saved locally');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      localStorage.setItem('admin_settings', JSON.stringify({ settings, paymentGateways, deliveryZones }));
      toast.success('Settings saved locally');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const togglePaymentGateway = (id) => {
    setPaymentGateways(prev => prev.map(gateway =>
      gateway.id === id ? { ...gateway, enabled: !gateway.enabled } : gateway
    ));
  };

  const addDeliveryZone = () => {
    if (!newZone.name || !newZone.fee || !newZone.estimatedDays) {
      toast.error('Please fill in all fields');
      return;
    }
    const newId = Math.max(...deliveryZones.map(z => z.id), 0) + 1;
    setDeliveryZones(prev => [...prev, {
      id: newId,
      name: newZone.name,
      fee: parseFloat(newZone.fee),
      estimatedDays: newZone.estimatedDays,
      enabled: true
    }]);
    setNewZone({ name: '', fee: '', estimatedDays: '', enabled: true });
    setShowAddZone(false);
    toast.success('Delivery zone added');
  };

  const updateDeliveryZone = () => {
    if (!editingZone) return;
    setDeliveryZones(prev => prev.map(zone =>
      zone.id === editingZone.id ? editingZone : zone
    ));
    setEditingZone(null);
    toast.success('Delivery zone updated');
  };

  const toggleDeliveryZone = (id) => {
    setDeliveryZones(prev => prev.map(zone =>
      zone.id === id ? { ...zone, enabled: !zone.enabled } : zone
    ));
  };

  const deleteDeliveryZone = (id) => {
    if (window.confirm('Are you sure you want to delete this delivery zone?')) {
      setDeliveryZones(prev => prev.filter(zone => zone.id !== id));
      toast.success('Delivery zone deleted');
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'delivery', name: 'Delivery', icon: TruckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-8 sm:pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cog6ToothIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-pink-500" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-playfair font-bold text-gray-800">System Settings</h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Configure your store settings, payments, and delivery options</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            {saving ? (
              <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-6 border-b overflow-x-auto scrollbar-hide pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 md:py-3 font-medium text-xs sm:text-sm md:text-base transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-pink-500 border-b-2 border-pink-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6">General Settings</h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Store Name</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => handleSettingChange('storeName', e.target.value)}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Store Email</label>
                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => handleSettingChange('storeEmail', e.target.value)}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Store Phone</label>
                  <input
                    type="tel"
                    value={settings.storePhone}
                    onChange={(e) => handleSettingChange('storePhone', e.target.value)}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Store Address</label>
                  <input
                    type="text"
                    value={settings.storeAddress}
                    onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="LSL">LSL - Lesotho Loti</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Low Stock Alert (units)</label>
                  <input
                    type="number"
                    value={settings.lowStockAlert}
                    onChange={(e) => handleSettingChange('lowStockAlert', parseInt(e.target.value))}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Gateways Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6">Payment Gateways</h2>
            <div className="space-y-3 sm:space-y-4">
              {paymentGateways.map((gateway) => (
                <div key={gateway.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <CreditCardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base">{gateway.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {gateway.enabled ? 'Active' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => togglePaymentGateway(gateway.id)}
                        className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition ${
                          gateway.enabled
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {gateway.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <span className={`text-xs sm:text-sm ${gateway.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {gateway.enabled ? (
                          <span className="flex items-center gap-0.5 sm:gap-1"><CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Active</span>
                        ) : (
                          <span className="flex items-center gap-0.5 sm:gap-1"><XCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Inactive</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">💡 Note: Payment gateway credentials can be configured in the next update.</p>
            </div>
          </div>
        )}

        {/* Delivery Settings Tab */}
        {activeTab === 'delivery' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold">Delivery Zones</h2>
              <button
                onClick={() => setShowAddZone(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition text-xs sm:text-sm w-full sm:w-auto justify-center"
              >
                <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Add Zone
              </button>
            </div>

            {/* Add Zone Modal */}
            {showAddZone && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-bold">Add Delivery Zone</h3>
                    <button onClick={() => setShowAddZone(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Zone Name</label>
                      <input
                        type="text"
                        value={newZone.name}
                        onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="e.g., Maseru"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Delivery Fee (LSL)</label>
                      <input
                        type="number"
                        value={newZone.fee}
                        onChange={(e) => setNewZone({...newZone, fee: e.target.value})}
                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="e.g., 50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Estimated Delivery</label>
                      <input
                        type="text"
                        value={newZone.estimatedDays}
                        onChange={(e) => setNewZone({...newZone, estimatedDays: e.target.value})}
                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="e.g., 1-2 days"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button onClick={addDeliveryZone} className="flex-1 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 text-sm">Add Zone</button>
                      <button onClick={() => setShowAddZone(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Zone Modal */}
            {editingZone && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-bold">Edit Delivery Zone</h3>
                    <button onClick={() => setEditingZone(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Zone Name</label>
                      <input
                        type="text"
                        value={editingZone.name}
                        onChange={(e) => setEditingZone({...editingZone, name: e.target.value})}
                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Delivery Fee (LSL)</label>
                      <input
                        type="number"
                        value={editingZone.fee}
                        onChange={(e) => setEditingZone({...editingZone, fee: e.target.value})}
                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Estimated Delivery</label>
                      <input
                        type="text"
                        value={editingZone.estimatedDays}
                        onChange={(e) => setEditingZone({...editingZone, estimatedDays: e.target.value})}
                        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button onClick={updateDeliveryZone} className="flex-1 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 text-sm">Update Zone</button>
                      <button onClick={() => setEditingZone(null)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-500">Zone</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-500">Fee</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-500">Est. Delivery</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {deliveryZones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">{zone.name}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">LSL {zone.fee}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{zone.estimatedDays}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <button
                          onClick={() => toggleDeliveryZone(zone.id)}
                          className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-xs font-medium ${
                            zone.enabled
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {zone.enabled ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex gap-1.5 sm:gap-2">
                          <button onClick={() => setEditingZone(zone)} className="text-yellow-600 hover:text-yellow-800">
                            <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button onClick={() => deleteDeliveryZone(zone.id)} className="text-red-600 hover:text-red-800">
                            <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6">Email Notifications</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Order Confirmation</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Send email when order is placed</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
                  <input
                    type="checkbox"
                    checked={settings.orderConfirmation}
                    onChange={(e) => handleSettingChange('orderConfirmation', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Payment Received</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Send email when payment is confirmed</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
                  <input
                    type="checkbox"
                    checked={settings.paymentReceived}
                    onChange={(e) => handleSettingChange('paymentReceived', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Order Shipped</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Send email when order is shipped</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
                  <input
                    type="checkbox"
                    checked={settings.orderShipped}
                    onChange={(e) => handleSettingChange('orderShipped', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Order Delivered</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Send email when order is delivered</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
                  <input
                    type="checkbox"
                    checked={settings.orderDelivered}
                    onChange={(e) => handleSettingChange('orderDelivered', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;