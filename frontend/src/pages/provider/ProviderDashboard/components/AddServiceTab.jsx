import React, { useState } from 'react';
import { apiRequest } from '../../../../api';

export default function AddServiceTab({ currentUser, setActiveTab, fetchListings }) {
  // Create Service Form State
  const [serviceType, setServiceType] = useState('hotel');
  const [nameOfInstitute, setNameOfInstitute] = useState('');
  const [contactNo, setContactNo] = useState(currentUser.contact_no || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);

  const handleCreateService = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const numericRegex = /^\d+$/;
    if (numericRegex.test(nameOfInstitute)) {
      alert('Institution name cannot consist only of numbers.');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(contactNo)) {
      alert('Contact number must be exactly 10 digits.');
      return;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      alert('Price must be a positive number.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('service_type', serviceType);
      formData.append('name_of_institute', nameOfInstitute);
      formData.append('contact_no', contactNo);
      formData.append('email', email);
      formData.append('price', price);
      formData.append('description', description);
      if (photo) {
        formData.append('photo', photo);
      } else {
        alert("Please upload a picture of the service listing.");
        return;
      }

      await apiRequest('services', 'create', 'POST', formData);
      alert("Service post created successfully! It is now enabled on the system.");
      
      // Reset form
      setNameOfInstitute('');
      setPrice('');
      setDescription('');
      setPhoto(null);
      
      setActiveTab('listings');
      fetchListings();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2 className="fw-bold text-gradient mb-4">Create Offer Post</h2>
      <div className="card glass-card border-0 p-4 col-lg-8">
        <form onSubmit={handleCreateService}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Select Service Category</label>
              <select className="form-select rounded-3" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                <option value="hotel">Hotel / Resort Booking</option>
                <option value="vehicle">Vehicle Hiring</option>
                <option value="guide">Tour Guide Hiring</option>
                <option value="camping_tool">Camping Gear Rental</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Name of Institute / Service Post Title</label>
              <input 
                type="text" 
                className="form-control rounded-3" 
                value={nameOfInstitute} 
                onChange={(e) => setNameOfInstitute(e.target.value)} 
                required 
                placeholder="e.g. Sigiriya Villa Resort, Ella Safaris"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Contact Phone Number</label>
              <input 
                type="tel" 
                className="form-control rounded-3" 
                value={contactNo} 
                onChange={(e) => setContactNo(e.target.value)} 
                required 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Email Address</label>
              <input 
                type="email" 
                className="form-control rounded-3" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Price / Day (LKR)</label>
              <input 
                type="number" 
                className="form-control rounded-3" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                required 
                placeholder="e.g. 5000"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Listing Image / Photo</label>
              <input 
                type="file" 
                className="form-control rounded-3" 
                accept="image/*" 
                onChange={(e) => setPhoto(e.target.files[0])} 
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Description / About the Service</label>
            <textarea 
              className="form-control rounded-3" 
              rows="4" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
              placeholder="Provide pricing parameters, inclusions, safety records, or policies..."
            ></textarea>
          </div>

          <button type="submit" className="btn btn-gradient px-5 py-2 rounded-pill shadow-sm">
            Publish Post
          </button>
        </form>
      </div>
    </div>
  );
}
