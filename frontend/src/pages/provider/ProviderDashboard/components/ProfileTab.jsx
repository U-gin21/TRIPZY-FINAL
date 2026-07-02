import React, { useState, useEffect } from 'react';
import { apiRequest, getUploadUrl, getProfilePhoto } from '../../../../api';

export default function ProfileTab({ currentUser, onProfileUpdate, listings, bookings }) {
  // Profile edit state
  const [profileFullName, setProfileFullName] = useState(currentUser.full_name || '');
  const [profileNameWithInitial, setProfileNameWithInitial] = useState(currentUser.name_with_initial || '');
  const [profileContactNo, setProfileContactNo] = useState(currentUser.contact_no || '');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setProfileFullName(currentUser.full_name || '');
    setProfileNameWithInitial(currentUser.name_with_initial || '');
    setProfileContactNo(currentUser.contact_no || '');
    setProfilePhoto(null);
  }, [currentUser]);

  useEffect(() => {
    if (!profilePhoto) {
      setPreviewPhotoUrl('');
      return;
    }

    const url = URL.createObjectURL(profilePhoto);
    setPreviewPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profilePhoto]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const formData = new FormData();
      let changed = false;

      const trimmedFull = profileFullName ? profileFullName.trim() : '';
      if (trimmedFull !== '' && trimmedFull !== (currentUser.full_name || '')) {
        formData.append('full_name', trimmedFull);
        changed = true;
      }

      const trimmedInit = profileNameWithInitial ? profileNameWithInitial.trim() : '';
      if (trimmedInit !== '' && trimmedInit !== (currentUser.name_with_initial || '')) {
        formData.append('name_with_initial', trimmedInit);
        changed = true;
      }

      const trimmedContact = profileContactNo ? profileContactNo.trim() : '';
      if (trimmedContact !== '' && trimmedContact !== (currentUser.contact_no || '')) {
        formData.append('contact_no', trimmedContact);
        changed = true;
      }

      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
        changed = true;
      }

      if (!changed) {
        alert('No changes to save. Update at least one field.');
        setProfileLoading(false);
        return;
      }

      const res = await apiRequest('profile', 'update', 'POST', formData);
      alert(res.message);

      if (onProfileUpdate) {
        const updated = { ...currentUser };
        if (trimmedFull !== '' && trimmedFull !== (currentUser.full_name || '')) updated.full_name = trimmedFull;
        if (trimmedInit !== '' && trimmedInit !== (currentUser.name_with_initial || '')) updated.name_with_initial = trimmedInit;
        if (trimmedContact !== '' && trimmedContact !== (currentUser.contact_no || '')) updated.contact_no = trimmedContact;
        if (res.profile_photo) updated.profile_photo = res.profile_photo;
        onProfileUpdate(updated);
      }
      setProfilePhoto(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div>
      <h2 className="fw-bold text-gradient mb-4">Manage Your Provider Profile</h2>
      <div className="row g-4 mb-4">
        {/* Profile Preview Card & Statistics */}
        <div className="col-lg-4">
          <div className="card glass-card border-0 overflow-hidden text-center pb-4 h-100">
            <div className="profile-card-header"></div>
            <div className="profile-avatar-container mb-3">
              <div className="profile-avatar-wrapper">
                <img
                  src={profilePhoto ? previewPhotoUrl : getProfilePhoto(currentUser.profile_photo)}
                  alt="Profile"
                  className="profile-avatar-img"
                />
                <label htmlFor="provider-profile-photo-input" className="profile-upload-overlay" title="Upload New Photo">
                  <i className="bi bi-camera-fill"></i>
                </label>
              </div>
            </div>
            <input
              type="file"
              id="provider-profile-photo-input"
              accept="image/*"
              className="d-none"
              onChange={(e) => setProfilePhoto(e.target.files[0] || null)}
            />
            <h4 className="fw-bold mb-1 text-gradient">{currentUser.full_name}</h4>
            <div className="mb-2">
              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 px-3 py-1">Service Provider Account</span>
            </div>
            <div className="profile-verified-badge mb-4">
              <i className="bi bi-shield-fill-check"></i> {currentUser.email} (Verified)
            </div>
            
            <div className="px-3">
              <h6 className="fw-bold text-start text-uppercase text-secondary small mb-3 border-bottom pb-2">Business Activity</h6>
              <div className="row g-3 text-start">
                <div className="col-6">
                  <div className="profile-stat-box text-center">
                    <div className="profile-stat-icon bg-success bg-opacity-10 text-success mx-auto">
                      <i className="bi bi-briefcase-fill"></i>
                    </div>
                    <h4 className="fw-bold mb-0 text-dark">{listings.length}</h4>
                    <span className="text-muted small">Active Listings</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="profile-stat-box text-center">
                    <div className="profile-stat-icon bg-primary bg-opacity-10 text-primary mx-auto">
                      <i className="bi bi-journal-check"></i>
                    </div>
                    <h4 className="fw-bold mb-0 text-dark">{bookings.length}</h4>
                    <span className="text-muted small">Total Bookings</span>
                  </div>
                </div>
                <div className="col-12">
                  <div className="profile-stat-box d-flex align-items-center gap-3">
                    <div className="profile-stat-icon bg-warning bg-opacity-10 text-warning mb-0">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0 text-dark">
                        {bookings.filter(b => b.status === 'pending').length}
                      </h5>
                      <span className="text-muted small">Pending Booking Requests</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Fields Form */}
        <div className="col-lg-8">
          <div className="card glass-card p-4 border-0 h-100">
            <h4 className="fw-bold mb-2 text-gradient"><i className="bi bi-person-fill-gear me-2"></i>Business Information</h4>
            <p className="text-muted small mb-4">Edit fields you wish to update. Unchanged fields will remain as they are.</p>
            <form onSubmit={handleUpdateProfile}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-person text-secondary"></i></span>
                    <input
                      type="text"
                      className="form-control rounded-end-3"
                      value={profileFullName}
                      onChange={(e) => setProfileFullName(e.target.value)}
                      placeholder={currentUser.full_name || ''}
                    />
                  </div>
                  <div className="form-text small">Leave empty to keep your current name.</div>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Name with Initials</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-person-badge text-secondary"></i></span>
                    <input
                      type="text"
                      className="form-control rounded-end-3"
                      value={profileNameWithInitial}
                      onChange={(e) => setProfileNameWithInitial(e.target.value)}
                      placeholder={currentUser.name_with_initial || ''}
                    />
                  </div>
                  <div className="form-text small">Leave empty to keep your current initials.</div>
                </div>

                <div className="col-md-12">
                  <label className="form-label small fw-bold">Contact Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-telephone text-secondary"></i></span>
                    <input
                      type="tel"
                      className="form-control rounded-end-3"
                      value={profileContactNo}
                      onChange={(e) => setProfileContactNo(e.target.value)}
                      placeholder={currentUser.contact_no || ''}
                    />
                  </div>
                  <div className="form-text small">Leave empty to keep your current contact number.</div>
                </div>
                
                <div className="col-12 mt-4 pt-3 border-top">
                  <button type="submit" className="btn btn-gradient w-100 py-3 rounded-pill shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2 animate-float-hover" disabled={profileLoading}>
                    {profileLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Saving Profile Details...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill"></i>
                        Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
