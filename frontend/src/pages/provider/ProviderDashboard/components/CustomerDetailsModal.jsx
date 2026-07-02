import React from 'react';
import { getUploadUrl } from '../../../../api';

export default function CustomerDetailsModal({ selectedCust }) {
  return (
    <div className="modal fade" id="customerDetailsModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0">
          <div className="modal-header border-0 pb-0">
            <h4 className="modal-title fw-bold text-gradient">Tourist Profile Details</h4>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body p-4">
            {selectedCust && (
              <div className="d-flex flex-column align-items-center text-center">
                <img 
                  src={selectedCust.tourist_profile_photo && selectedCust.tourist_profile_photo !== 'default_profile.jpg' ? getUploadUrl(selectedCust.tourist_profile_photo) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                  alt="Customer" 
                  className="rounded-circle mb-3 border-2 border-primary" 
                  style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                />
                <h5 className="fw-bold mb-1">{selectedCust.tourist_name}</h5>
                <span className="badge bg-secondary mb-3">Tourist Member</span>
                
                <div className="w-100 text-start bg-light p-3 rounded-3 mt-2">
                  <p className="mb-2"><strong>Email Address:</strong> {selectedCust.tourist_email}</p>
                  <p className="mb-0"><strong>Contact Phone:</strong> {selectedCust.tourist_contact}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
