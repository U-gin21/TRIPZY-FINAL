import React, { useState } from 'react';
import { getUploadUrl } from '../../../../api';

export default function UsersTab({ users, handleToggleUserStatus, onViewUserSummary }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter users based on query, role, and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nic_passport.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.user_type === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="card glass-card p-4 border-0 shadow-lg mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-gradient mb-1">Registered Users Management</h2>
          <p className="text-muted small mb-0">Suspend or reactivate accounts, filter roles, and monitor user statuses</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <span className="badge bg-emerald rounded-pill px-3 py-2">
            Total Users: {filteredUsers.length}
          </span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="row g-3 mb-4 align-items-end">
        <div className="col-md-5">
          <label className="form-label small fw-bold text-muted">Search User</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by name, email, or NIC/Passport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ boxShadow: 'none' }}
            />
          </div>
        </div>

        <div className="col-md-3">
          <label className="form-label small fw-bold text-muted">Role Filter</label>
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ boxShadow: 'none' }}
          >
            <option value="all">All Roles</option>
            <option value="tourist">Tourists</option>
            <option value="provider">Service Providers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label small fw-bold text-muted">Status Filter</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ boxShadow: 'none' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-responsive">
        {filteredUsers.length > 0 ? (
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Contact info</th>
                <th>NIC/Passport</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={user.profile_photo && user.profile_photo !== 'default_profile.jpg' ? getUploadUrl(user.profile_photo) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                        alt={user.full_name}
                        className="rounded-circle shadow-sm"
                        style={{ width: '40px', height: '40px', objectFit: 'cover', border: '2px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}
                        data-bs-toggle="modal"
                        data-bs-target="#adminUserSummaryModal"
                        onClick={() => onViewUserSummary(user)}
                      />
                      <div>
                        <h6 
                          className="fw-bold mb-0 text-dark text-gradient-hover text-decoration-none"
                          style={{ cursor: 'pointer' }}
                          data-bs-toggle="modal"
                          data-bs-target="#adminUserSummaryModal"
                          onClick={() => onViewUserSummary(user)}
                        >
                          {user.full_name}
                        </h6>
                        <span className="text-muted small">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {user.user_type === 'tourist' ? (
                      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 fw-bold text-uppercase" style={{ fontSize: '10px' }}>
                        Tourist
                      </span>
                    ) : user.user_type === 'admin' ? (
                      <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-1 fw-bold text-uppercase" style={{ fontSize: '10px' }}>
                        Admin
                      </span>
                    ) : (
                      <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 fw-bold text-uppercase" style={{ fontSize: '10px' }}>
                        Provider
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="small text-muted">{user.contact_no}</span>
                  </td>
                  <td>
                    <span className="small text-muted">{user.nic_passport}</span>
                  </td>
                  <td>
                    {user.status === 'active' && (
                      <span className="badge bg-success bg-opacity-12 text-success rounded-pill px-3 py-1 fw-semibold">
                        Active
                      </span>
                    )}
                    {user.status === 'suspended' && (
                      <span className="badge bg-danger bg-opacity-12 text-danger rounded-pill px-3 py-1 fw-semibold">
                        Suspended
                      </span>
                    )}
                    {user.status === 'pending' && (
                      <span className="badge bg-warning bg-opacity-12 text-warning rounded-pill px-3 py-1 fw-semibold">
                        Pending
                      </span>
                    )}
                    {user.status === 'rejected' && (
                      <span className="badge bg-secondary bg-opacity-12 text-secondary rounded-pill px-3 py-1 fw-semibold">
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="text-end">
                    {user.status === 'active' && (
                      <button
                        className="btn btn-danger btn-sm rounded-pill px-3 fw-bold"
                        onClick={() => handleToggleUserStatus(user.id, 'active')}
                      >
                        <i className="bi bi-slash-circle me-1"></i> Suspend
                      </button>
                    )}
                    {user.status === 'suspended' && (
                      <button
                        className="btn btn-emerald btn-sm rounded-pill px-3 fw-bold text-white"
                        onClick={() => handleToggleUserStatus(user.id, 'suspended')}
                        style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                      >
                        <i className="bi bi-check-circle me-1"></i> Activate
                      </button>
                    )}
                    {(user.status === 'pending' || user.status === 'rejected') && (
                      <span className="text-muted small italic">Manage in Approvals Tab</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-people-fill text-muted fs-1"></i>
            <p className="mt-3 text-muted">No registered users found matching the filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
