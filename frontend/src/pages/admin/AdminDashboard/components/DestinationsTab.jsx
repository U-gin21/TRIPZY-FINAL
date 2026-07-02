import React, { useState } from 'react';
import { apiRequest } from '../../../../api';

export default function DestinationsTab({ destinations, fetchDestinations, showConfirm }) {
  // Destination Creation/Edit State
  const [editingDestId, setEditingDestId] = useState(null);
  const [destName, setDestName] = useState('');
  const [destDistrict, setDestDistrict] = useState('Colombo');
  const [destDesc, setDestDesc] = useState('');
  const [destImage, setDestImage] = useState(null);
  const [destPerfectTime, setDestPerfectTime] = useState('');
  const [destBudget, setDestBudget] = useState('mid-range');
  const [destInterest, setDestInterest] = useState('Beaches');
  const [destLat, setDestLat] = useState('');
  const [destLon, setDestLon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interestOptions = [
    'Beaches', 'Mountains', 'Camping', 'Wildlife', 
    'Historical places', 'Adventure', 'Nature', 'Cultural destinations'
  ];
  
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  const handleEditClick = (d) => {
    setEditingDestId(d.id);
    setDestName(d.name);
    setDestDistrict(d.district);
    setDestDesc(d.description);
    setDestPerfectTime(d.perfect_time || '');
    setDestBudget(d.budget_category);
    setDestInterest(d.interest_category);
    setDestLat(d.latitude);
    setDestLon(d.longitude);
    setDestImage(null);
  };

  const handleCancelEdit = () => {
    setEditingDestId(null);
    setDestName('');
    setDestDistrict('Colombo');
    setDestDesc('');
    setDestPerfectTime('');
    setDestBudget('mid-range');
    setDestInterest('Beaches');
    setDestLat('');
    setDestLon('');
    setDestImage(null);
    const fileInput = document.getElementById('dest-image-input');
    if (fileInput) fileInput.value = '';
  };

  const handleCreateDestination = async (e) => {
    e.preventDefault();

    const numericRegex = /^\d+$/;
    if (numericRegex.test(destName.trim())) {
      alert('Destination name cannot consist only of numbers.');
      return;
    }

    if (isNaN(destLat) || parseFloat(destLat) < -90 || parseFloat(destLat) > 90) {
      alert('Latitude must be a valid number between -90 and 90.');
      return;
    }

    if (isNaN(destLon) || parseFloat(destLon) < -180 || parseFloat(destLon) > 180) {
      alert('Longitude must be a valid number between -180 and 180.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', destName);
      formData.append('district', destDistrict);
      formData.append('description', destDesc);
      formData.append('perfect_time', destPerfectTime);
      formData.append('budget_category', destBudget);
      formData.append('interest_category', destInterest);
      formData.append('latitude', destLat);
      formData.append('longitude', destLon);
      if (destImage) {
        formData.append('image', destImage);
      }

      if (editingDestId) {
        await apiRequest('destinations', `update&id=${editingDestId}`, 'POST', formData);
        alert("Destination updated successfully!");
      } else {
        await apiRequest('destinations', 'create', 'POST', formData);
        alert("Destination created successfully!");
      }
      
      handleCancelEdit();
      fetchDestinations();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDestination = (id) => {
    showConfirm(
      "Delete this destination?",
      async () => {
        try {
          await apiRequest('destinations', 'delete', 'POST', { id });
          alert("Destination deleted.");
          fetchDestinations();
        } catch (err) {
          alert(err.message);
        }
      },
      "Delete Destination"
    );
  };

  return (
    <div>
      <h2 className="fw-bold text-gradient mb-4">Destination Management</h2>
      <div className="row g-4">
        {/* Form to Create Destination */}
        <div className="col-md-4">
          <div className="card glass-card p-4 border-0">
            <h5 className="fw-bold mb-3 text-gradient">
              {editingDestId ? `Edit ${destName || 'Destination'}` : 'Add New Destination'}
            </h5>
            <form onSubmit={handleCreateDestination}>
              <div className="mb-2">
                <label className="form-label small fw-bold">Destination Name</label>
                <input type="text" className="form-control rounded-3 form-control-sm" value={destName} onChange={(e) => setDestName(e.target.value)} required />
              </div>
              <div className="mb-2">
                <label className="form-label small fw-bold">Select District</label>
                <select className="form-select rounded-3 form-select-sm" value={destDistrict} onChange={(e) => setDestDistrict(e.target.value)}>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="mb-2">
                <label className="form-label small fw-bold">Interest Category</label>
                <select className="form-select rounded-3 form-select-sm" value={destInterest} onChange={(e) => setDestInterest(e.target.value)}>
                  {interestOptions.map(io => <option key={io} value={io}>{io}</option>)}
                </select>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">Latitude</label>
                  <input type="text" className="form-control rounded-3 form-control-sm" value={destLat} onChange={(e) => setDestLat(e.target.value)} required placeholder="e.g. 6.87" />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Longitude</label>
                  <input type="text" className="form-control rounded-3 form-control-sm" value={destLon} onChange={(e) => setDestLon(e.target.value)} required placeholder="e.g. 81.04" />
                </div>
              </div>
              <div className="mb-2">
                <label className="form-label small fw-bold">Budget Tier</label>
                <select className="form-select rounded-3 form-select-sm" value={destBudget} onChange={(e) => setDestBudget(e.target.value)}>
                  <option value="budget">Budget</option>
                  <option value="mid-range">Mid-Range</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="form-label small fw-bold">Perfect Time to Visit</label>
                <input type="text" className="form-control rounded-3 form-control-sm" value={destPerfectTime} onChange={(e) => setDestPerfectTime(e.target.value)} required placeholder="e.g. December to April, Dry season" />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Destination Photo</label>
                <input 
                  type="file" 
                  id="dest-image-input"
                  className="form-control rounded-3 form-control-sm" 
                  accept="image/*" 
                  onChange={(e) => setDestImage(e.target.files[0])} 
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Description</label>
                <textarea className="form-control rounded-3 form-control-sm" rows="3" value={destDesc} onChange={(e) => setDestDesc(e.target.value)} required></textarea>
              </div>
              <button type="submit" className="btn btn-gradient btn-sm w-100 py-2 rounded-pill shadow-sm" disabled={isSubmitting}>
                {isSubmitting 
                  ? (editingDestId ? 'Updating...' : 'Saving Destination...') 
                  : (editingDestId ? 'Update Destination' : 'Save Destination')}
              </button>
              {editingDestId && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-sm w-100 py-2 rounded-pill shadow-sm mt-2" 
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>

        {/* List Destinations */}
        <div className="col-md-8">
          <div className="card glass-card p-4 border-0">
            <h5 className="fw-bold mb-3 text-gradient">Current Active Locations</h5>
            <div className="table-responsive" style={{ maxHeight: '550px' }}>
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Location</th>
                    <th>District</th>
                    <th>Interest</th>
                    <th>Coordinates</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {destinations.map(d => (
                    <tr key={d.id}>
                      <td>
                        <strong>{d.name}</strong>
                        {d.admin_name && <span className="d-block text-muted" style={{ fontSize: '11px' }}>Added by: {d.admin_name}</span>}
                      </td>
                      <td>{d.district}</td>
                      <td><span className="badge bg-success bg-opacity-10 text-success">{d.interest_category}</span></td>
                      <td><span className="small text-muted">{d.latitude}, {d.longitude}</span></td>
                      <td>
                        <button 
                          className="btn btn-outline-primary btn-sm rounded-circle me-1" 
                          onClick={() => handleEditClick(d)}
                          title="Edit Location"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm rounded-circle" 
                          onClick={() => handleDeleteDestination(d.id)}
                          title="Delete Location"
                        >
                          <i className="bi bi-trash"></i>
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
    </div>
  );
}
