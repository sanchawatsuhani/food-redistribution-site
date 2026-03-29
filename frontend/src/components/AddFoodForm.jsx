import { useState } from 'react';
import { FiUpload, FiPlus, FiX } from 'react-icons/fi';
import api from '../services/api';
import { SERVICE_AREAS } from '../constants/areas';

export default function AddFoodForm({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    foodItem: '', quantity: '', location: '', area: '', pickupTime: '', image: null
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('foodItem', form.foodItem);
      formData.append('quantity', form.quantity);
      formData.append('location', form.location);
      formData.append('area', form.area);
      formData.append('pickupTime', form.pickupTime);
      if (form.image) formData.append('image', form.image);

      await api.post('/food', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ foodItem: '', quantity: '', location: '', area: '', pickupTime: '', image: null });
      setImagePreview(null);
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className="add-food-toggle">
        <button className="btn btn-primary" onClick={() => setOpen(true)} id="add-food-btn">
          <FiPlus size={18} /> Add Food Listing
        </button>
      </div>
    );
  }

  return (
    <form className="add-food-form" onSubmit={handleSubmit} id="add-food-form">
      <h3><FiPlus /> New Food Listing</h3>
      {error && <div className="form-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Food Item *</label>
          <input className="form-input" name="foodItem" placeholder="e.g. Rice & Curry, Sandwiches" value={form.foodItem} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Quantity *</label>
          <input className="form-input" name="quantity" placeholder="e.g. 20 meals, 5 kg" value={form.quantity} onChange={handleChange} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Location *</label>
          <input className="form-input" name="location" placeholder="123 Main St, Building A" value={form.location} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Area *</label>
          <select className="form-select" name="area" value={form.area} onChange={handleChange} required>
            <option value="">Select area</option>
            {SERVICE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Pickup Time *</label>
        <input className="form-input" type="datetime-local" name="pickupTime" value={form.pickupTime} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label className="form-label">Food Image (optional)</label>
        <div className="image-upload">
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <div className="image-upload-icon"><FiUpload size={24} /></div>
          <div className="image-upload-text">Click or drag to upload an image</div>
          <div className="image-upload-hint">JPG, PNG, WebP — Max 5MB</div>
        </div>
        {imagePreview && (
          <div className="image-preview"><img src={imagePreview} alt="Preview" /></div>
        )}
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : '✨ Create Listing'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
          <FiX size={16} /> Cancel
        </button>
      </div>
    </form>
  );
}
