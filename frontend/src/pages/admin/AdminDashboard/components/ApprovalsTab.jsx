import React from 'react';
import { getUploadUrl } from '../../../../api';

export default function ApprovalsTab({ pendingAdmins, pendingProviders, handleApproveUser, approvingUsers }) {
  return (
    <div>
      <h2 className="fw-bold text-gradient mb-4">Pending Requests Approval Panel</h2>
      
      <div className="row g-4">
        {/* Admin Registrations approvals */}
        <div className="col-md-6">
          <div className="card glass-card p-4 border-0 h-100">
            <h4 className="fw-bold mb-3 text-danger"><i className="bi bi-person-lock"></i> Pending Admins</h4>
            {pendingAdmins.length > 0 ? (
              <div className="list-group list-group-flush">
                {pendingAdmins.map(adm => (
                  <div className="list-group-item bg-transparent px-0 py-3 d-flex justify-content-between align-items-center" key={adm.id}>
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={adm.profile_photo && adm.profile_photo !== 'default_profile.jpg' ? getUploadUrl(adm.profile_photo) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                        alt="Profile"
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.08)' }}
                      />
                      <div>
                        <h6 className="fw-bold mb-0">{adm.full_name}</h6>
                        <span className="text-muted small">{adm.email} | NIC: {adm.nic_passport}</span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-success btn-sm rounded-pill px-3 d-flex align-items-center gap-1" 
                        onClick={() => handleApproveUser(adm.id, 'active', 'admin')}
                        disabled={!!(approvingUsers && approvingUsers[adm.id])}
                      >
                        {approvingUsers && approvingUsers[adm.id] ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : 'Approve'}
                      </button>
                      <button 
                        className="btn btn-outline-danger btn-sm rounded-pill px-3" 
                        onClick={() => handleApproveUser(adm.id, 'rejected', 'admin')}
                        disabled={!!(approvingUsers && approvingUsers[adm.id])}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small text-center py-4">No pending admin registration requests.</p>
            )}
          </div>
        </div>

        {/* Service Provider approvals */}
        <div className="col-md-6">
          <div className="card glass-card p-4 border-0 h-100">
            <h4 className="fw-bold mb-3 text-success"><i className="bi bi-briefcase"></i> Pending Service Providers</h4>
            {pendingProviders.length > 0 ? (
              <div className="list-group list-group-flush">
                {pendingProviders.map(prov => (
                  <div className="list-group-item bg-transparent px-0 py-3 d-flex justify-content-between align-items-center" key={prov.id}>
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={prov.profile_photo && prov.profile_photo !== 'default_profile.jpg' ? getUploadUrl(prov.profile_photo) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                        alt="Profile"
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.08)' }}
                      />
                      <div>
                        <h6 className="fw-bold mb-0">{prov.full_name}</h6>
                        <span className="text-muted small">{prov.email} | Contact: {prov.contact_no}</span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-success btn-sm rounded-pill px-3 d-flex align-items-center gap-1" 
                        onClick={() => handleApproveUser(prov.id, 'active', 'provider')}
                        disabled={!!(approvingUsers && approvingUsers[prov.id])}
                      >
                        {approvingUsers && approvingUsers[prov.id] ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : 'Approve'}
                      </button>
                      <button 
                        className="btn btn-outline-danger btn-sm rounded-pill px-3" 
                        onClick={() => handleApproveUser(prov.id, 'rejected', 'provider')}
                        disabled={!!(approvingUsers && approvingUsers[prov.id])}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small text-center py-4">No pending provider verification requests.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
