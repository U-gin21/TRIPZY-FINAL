import { useCallback, useEffect, useState } from 'react';
import { getUploadUrl, getProfilePhoto } from '../../../api';
import PageHero from '../../../components/common/PageHero';
import companion_finder from '../../../assets/companion_finder.jpeg';
import { companionService } from '../../../services/companionService';
import './CompanionFinder.css';

export default function CompanionFinder({ currentUser, onNavigate }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Filters
  const [filterDest, setFilterDest] = useState('');
  const [filterGender, setFilterGender] = useState('');

  // Create Post Form State
  const [dest, setDest] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [companionsNeeded, setCompanionsNeeded] = useState(1);
  const [genderPref, setGenderPref] = useState('Any');
  const [interests, setInterests] = useState('');
  const [desc, setDesc] = useState('');

  // Request Join Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [requestMsg, setRequestMsg] = useState('');

  // Requests
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const postsData = await companionService.listPosts({
        destination: filterDest,
        gender_preference: filterGender
      });
      setPosts(postsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterDest, filterGender]);

  const fetchIncomingRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const requestsData = await companionService.getIncomingRequests();
      setIncomingRequests(requestsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const fetchSentRequests = useCallback(async () => {
    try {
      const requestsData = await companionService.getMyRequests();
      setSentRequests(requestsData);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchMyPosts = useCallback(async () => {
    try {
      const postsData = await companionService.getMyPosts();
      setMyPosts(postsData);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchPosts();
    if (currentUser) {
      fetchIncomingRequests();
      fetchSentRequests();
      fetchMyPosts();
    }
  }, [currentUser, fetchPosts, fetchIncomingRequests, fetchSentRequests, fetchMyPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (currentUser) {
      fetchIncomingRequests();
      fetchSentRequests();
      fetchMyPosts();
    } else {
      setIncomingRequests([]);
      setSentRequests([]);
      setMyPosts([]);
    }
  }, [currentUser, fetchIncomingRequests, fetchSentRequests, fetchMyPosts]);

  const safeHideModal = (modalId) => {
    try {
      const modalElement = document.getElementById(modalId);
      if (modalElement && window.bootstrap && window.bootstrap.Modal) {
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }
    } catch (err) {
      console.error(`Error hiding modal ${modalId}:`, err);
    }
    // Force backdrop cleanup to prevent black screen overlay
    setTimeout(() => {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 100);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setMsg({ type: 'danger', text: 'You must log in to create companion posts.' });
      return;
    }
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      await companionService.createPost({
        destination_place: dest,
        start_date: startDate,
        end_date: endDate,
        budget_range: budget,
        companions_needed: companionsNeeded,
        gender_preference: genderPref,
        travel_interests: interests,
        description: desc
      });
      
      setMsg({ type: 'success', text: 'Companion finder post created successfully!' });
      setDest('');
      setStartDate('');
      setEndDate('');
      setBudget('');
      setCompanionsNeeded(1);
      setGenderPref('Any');
      setInterests('');
      setDesc('');

      refreshData();
      safeHideModal('createPostModal');
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to join trips.');
      return;
    }
    try {
      await companionService.sendRequest(selectedPost.id, requestMsg);
      alert('Join request sent successfully! You will be notified via email once the host approves.');
      setRequestMsg('');
      refreshData();
      safeHideModal('requestJoinModal');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      await companionService.updateRequest(requestId, status);
      setMsg({ type: 'success', text: `Request ${status} successfully.` });
      refreshData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  return (
    <>
      <PageHero
        badge="👥 Travel Companions"
        title="Find Your Travel Buddy"
        subtitle="Connect with fellow adventurers, plan joint trips, share expenses, and discover Sri Lanka together."
        backgroundImage={companion_finder}
      >
        {/* Floating statistics row */}
        <div className="d-flex flex-wrap justify-content-center gap-3 mb-4 mt-2">
          <div className="text-center px-4 py-2 rounded-4 glass-card bg-white bg-opacity-10 border border-white-50 text-white" style={{ minWidth: '160px', backdropFilter: 'blur(8px)' }}>
            <h4 className="fw-bold mb-0 text-shadow text-gradient" style={{ color: 'var(--accent-color)', WebkitTextFillColor: 'unset' }}><i className="bi bi-people-fill"></i> 1,200+</h4>
            <span className="small text-white-50" style={{ fontSize: '11px' }}>Companions Met</span>
          </div>
          <div className="text-center px-4 py-2 rounded-4 glass-card bg-white bg-opacity-10 border border-white-50 text-white" style={{ minWidth: '160px', backdropFilter: 'blur(8px)' }}>
            <h4 className="fw-bold mb-0 text-shadow text-gradient" style={{ color: 'var(--accent-color)', WebkitTextFillColor: 'unset' }}><i className="bi bi-map-fill"></i> 450+</h4>
            <span className="small text-white-50" style={{ fontSize: '11px' }}>Trips Shared</span>
          </div>
          <div className="text-center px-4 py-2 rounded-4 glass-card bg-white bg-opacity-10 border border-white-50 text-white" style={{ minWidth: '160px', backdropFilter: 'blur(8px)' }}>
            <h4 className="fw-bold mb-0 text-shadow text-gradient" style={{ color: 'var(--accent-color)', WebkitTextFillColor: 'unset' }}><i className="bi bi-shield-fill-check"></i> 100%</h4>
            <span className="small text-white-50" style={{ fontSize: '11px' }}>Vetted Members</span>
          </div>
        </div>

        {/* Search filter card */}
        <div className="card glass-card p-4 border-0 shadow-lg mx-auto mb-4" style={{ maxWidth: '850px', background: 'rgba(5, 25, 44, 0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <div className="row g-3 text-start align-items-end">
            <div className="col-md-5">
              <label className="form-label small fw-bold text-white-50">Filter Destination</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-0 text-white-50" style={{ pointerEvents: 'none' }}><i className="bi bi-search"></i></span>
                <input 
                  type="text" 
                  className="form-control transparent-hero-input rounded-3" 
                  placeholder="e.g. Ella, Kandy..." 
                  value={filterDest}
                  onChange={(e) => setFilterDest(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-5">
              <label className="form-label small fw-bold text-white-50">Gender Preference</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-0 text-white-50" style={{ pointerEvents: 'none' }}><i className="bi bi-gender-ambiguous"></i></span>
                <select className="form-select transparent-hero-input rounded-3" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                  <option value="">Any Gender Preference</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                  <option value="Any">Co-ed / Any</option>
                </select>
              </div>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-light w-100 py-2 rounded-3" style={{ border: '2px solid rgba(255, 255, 255, 0.5)' }} onClick={() => { setFilterDest(''); setFilterGender(''); }}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="d-flex justify-content-center">
          <button 
            className="btn btn-gradient btn-lg rounded-pill px-5 py-3 shadow animate-pulse" 
            data-bs-toggle={currentUser ? "modal" : undefined} 
            data-bs-target={currentUser ? "#createPostModal" : undefined}
            onClick={() => {
              if (!currentUser) {
                if (onNavigate) {
                  onNavigate('auth');
                } else {
                  alert("Please log in to post a travel plan.");
                }
              }
            }}
          >
            <i className="bi bi-plus-circle-fill me-2"></i> Post Travel Plan
          </button>
        </div>
      </PageHero>

      <div className="container py-5">
        <div className="animate-fade-in">
          {msg.text && (
            <div className={`alert alert-${msg.type} text-center`} role="alert">
              {msg.text}
            </div>
          )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-emerald" role="status">
            <span className="visually-hidden">Loading Posts...</span>
          </div>
        </div>
      ) : posts.length > 0 ? (
        <div className="row">
          {posts.map((post) => {
            const age = post.date_of_birth ? new Date().getFullYear() - new Date(post.date_of_birth).getFullYear() : 25;
            
            const avatarUrl = getProfilePhoto(post.owner_photo);

            return (
              <div className="col-12" key={post.id}>
                <div className="horizontal-companion-card animate-fade-in">
                  {/* User details, description and buttons */}
                  <div className="companion-card-info-section">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        {/* User Avatar + Details */}
                        <div className="d-flex align-items-center gap-3">
                          <img 
                            src={avatarUrl} 
                            alt={post.full_name} 
                            className="rounded-circle border border-2 border-emerald" 
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>{post.full_name}</h6>
                            <span className="text-muted text-capitalize" style={{ fontSize: '11px' }}>
                              {post.owner_gender || 'Gender'}, {age} yrs • <i className="bi bi-star-fill text-warning"></i> 4.9 Rating
                            </span>
                          </div>
                        </div>

                        {/* Companions Needed badge */}
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill small">
                          Need: <strong className="text-emerald">{post.companions_needed}</strong> companions
                        </span>
                      </div>

                      {/* Destination Heading */}
                      <h3 className="fw-bold text-gradient mb-2">{post.destination_place}</h3>

                      {/* Travel Date & Budget Badges */}
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <span className="badge bg-success px-3 py-2 rounded-pill small">
                          Confirmed Trip
                        </span>
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill small">
                          <i className="bi bi-calendar-event me-1"></i> {post.start_date} to {post.end_date}
                        </span>
                        <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill small">
                          <i className="bi bi-wallet2 me-1"></i> LKR {post.budget_range}
                        </span>
                        {post.gender_preference && (
                          <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill small text-capitalize">
                            Pref: {post.gender_preference}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-muted small mb-3" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{post.description}</p>
                      
                      {/* Travel Interests */}
                      <div className="mb-2">
                        <span className="small d-inline-block fw-bold text-secondary me-2">Travel Interests:</span>
                        <span className="text-muted small">{post.travel_interests}</span>
                      </div>
                    </div>

                    {/* Join Trip Button */}
                    <div className="pt-3 border-top d-flex justify-content-end align-items-center mt-2">
                      {currentUser && currentUser.id == post.owner_id ? (
                        <span className="badge bg-teal text-white rounded-pill px-4 py-2 shadow-sm" style={{ background: '#0d9488' }}>Your Post</span>
                      ) : (
                        <button 
                          className="btn btn-gradient rounded-pill px-4 py-2 shadow-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#requestJoinModal"
                          onClick={() => setSelectedPost(post)}
                        >
                          <i className="bi bi-send me-1"></i> Join Trip
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-5 card glass-card border-0">
          <i className="bi bi-people fs-1 text-muted"></i>
          <h4 className="fw-bold mt-3">No Active Companion Searches</h4>
          <p className="text-muted">Create a new travel plan to find companions.</p>
        </div>
      )}

      {currentUser && (
        <>
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Incoming Requests</h3>
              <button className="btn btn-sm btn-outline-gradient" onClick={refreshData}>Refresh</button>
            </div>
            {loadingRequests ? (
              <div className="text-center py-4">
                <div className="spinner-border text-secondary" role="status"></div>
              </div>
            ) : incomingRequests.length > 0 ? (
              <div className="row g-3">
                {incomingRequests.map((request) => (
                  <div className="col-md-6" key={request.id}>
                    <div className="card glass-card border-0 p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="fw-bold mb-1">{request.requester_name}</h5>
                          <small className="text-muted">Requested for {request.destination_place}</small>
                        </div>
                        <span className={`badge rounded-pill px-3 py-2 ${request.status === 'pending' ? 'bg-warning text-dark' : request.status === 'accepted' ? 'bg-success' : 'bg-danger'}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="mb-2"><strong>Message:</strong> {request.message || 'No message provided.'}</p>
                      <p className="mb-2"><strong>Requester Contact:</strong> {request.requester_email}, {request.requester_contact}</p>
                      <div className="d-flex gap-2 flex-wrap mt-3">
                        <button className="btn btn-sm btn-success rounded-pill" disabled={request.status !== 'pending'} onClick={() => handleRequestAction(request.id, 'accepted')}>
                          Accept
                        </button>
                        <button className="btn btn-sm btn-outline-danger rounded-pill" disabled={request.status !== 'pending'} onClick={() => handleRequestAction(request.id, 'rejected')}>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card glass-card border-0 p-4 text-center">
                <p className="mb-0 text-muted">No incoming join requests yet. Share your trip post and invite others.</p>
              </div>
            )}
          </div>

          <div className="mt-5">
            <h3 className="mb-3">Your Active Companion Posts</h3>
            {myPosts.length > 0 ? (
              <div className="row g-3">
                {myPosts.map((post) => (
                  <div className="col-md-6" key={post.id}>
                    <div className="card glass-card border-0 p-4">
                      <h5 className="fw-bold mb-1">{post.destination_place}</h5>
                      <p className="mb-1 text-muted small">{post.start_date} – {post.end_date}</p>
                      <p className="mb-1"><strong>Need:</strong> {post.companions_needed} companions</p>
                      <p className="mb-1"><strong>Budget:</strong> LKR {post.budget_range}</p>
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{post.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card glass-card border-0 p-4 text-center">
                <p className="mb-0 text-muted">You don't have any active companion posts yet.</p>
              </div>
            )}
          </div>

          <div className="mt-5">
            <h3 className="mb-3">Requests You Sent</h3>
            {sentRequests.length > 0 ? (
              <div className="row g-3">
                {sentRequests.map((request) => (
                  <div className="col-md-6" key={request.id}>
                    <div className="card glass-card border-0 p-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="fw-bold mb-0">{request.destination_place}</h5>
                        <span className={`badge rounded-pill px-3 py-2 ${request.status === 'pending' ? 'bg-warning text-dark' : request.status === 'accepted' ? 'bg-success' : 'bg-danger'}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="mb-1 text-muted small">Host: {request.owner_name}</p>
                      <p className="mb-0 text-truncate">{request.message || 'No message provided.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card glass-card border-0 p-4 text-center">
                <p className="mb-0 text-muted">You haven't sent any join requests yet.</p>
              </div>
            )}
          </div>
        </>
      )}

      </div>

      <div className="modal fade" id="createPostModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient">Create Companion Request Post</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Destination / Place</label>
                  <input 
                    type="text" 
                    className="form-control rounded-3" 
                    value={dest} 
                    onChange={(e) => setDest(e.target.value)} 
                    required 
                    placeholder="e.g. Ella, Kandy, Sigiriya"
                  />
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold">Start Date</label>
                    <input 
                      type="date" 
                      className="form-control rounded-3" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold">End Date</label>
                    <input 
                      type="date" 
                      className="form-control rounded-3" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold">Budget Range (LKR)</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3" 
                      value={budget} 
                      onChange={(e) => setBudget(e.target.value)} 
                      required 
                      placeholder="e.g. 10,000 - 20,000"
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold">Companions Needed</label>
                    <input 
                      type="number" 
                      className="form-control rounded-3" 
                      min="1"
                      value={companionsNeeded} 
                      onChange={(e) => setCompanionsNeeded(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Gender Preference</label>
                  <select className="form-select rounded-3" value={genderPref} onChange={(e) => setGenderPref(e.target.value)}>
                    <option value="Any">Co-ed / Any Gender</option>
                    <option value="male">Male Companions Only</option>
                    <option value="female">Female Companions Only</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Travel Interests</label>
                  <input 
                    type="text" 
                    className="form-control rounded-3" 
                    value={interests} 
                    onChange={(e) => setInterests(e.target.value)} 
                    required 
                    placeholder="e.g. Hiking, Photography, Camping"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">About the Trip / Description</label>
                  <textarea 
                    className="form-control rounded-3" 
                    rows="3" 
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)} 
                    required 
                    placeholder="Describe your trip itinerary, plans, and who you are looking to travel with..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-gradient rounded-pill px-4" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="requestJoinModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient">Request to Join Trip</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSendRequest}>
              <div className="modal-body p-4">
                {selectedPost && (
                  <div className="bg-light p-3 rounded-3 mb-3">
                    <span className="small text-muted d-block">Requesting to join trip of:</span>
                    <strong className="text-dark">{selectedPost.full_name}</strong> to <strong>{selectedPost.destination_place}</strong>
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label small fw-bold">Introduction Message</label>
                  <textarea 
                    className="form-control rounded-3" 
                    rows="4" 
                    value={requestMsg} 
                    onChange={(e) => setRequestMsg(e.target.value)} 
                    required 
                    placeholder="Introduce yourself, mention why you want to join and how your budget fits..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-gradient rounded-pill px-4">Send Join Request</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
