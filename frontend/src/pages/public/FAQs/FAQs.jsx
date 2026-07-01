import { useEffect, useState } from 'react';
import { apiRequest, getUploadUrl, getProfilePhoto } from '../../../api';
import FAQ from '../../../assets/FAQ.jpg';
import PageHero from '../../../components/common/PageHero';

export default function FAQs({ currentUser, onNavigate }) {
  const [faqs, setFaqs] = useState([]);
  const [userQas, setUserQas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Ask Question Form State
  const [newQuestion, setNewQuestion] = useState('');
  const [askLoading, setAskLoading] = useState(false);

  // Platform Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  async function fetchFaqs() {
    try {
      const res = await apiRequest('faqs', 'list');
      setFaqs(res.faqs || []);
      setUserQas(res.user_qas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setAskLoading(true);
    try {
      const res = await apiRequest('faqs', 'ask', 'POST', { question: newQuestion.trim() });
      alert(res.message);
      setNewQuestion('');
      fetchFaqs(); // Refresh list (unanswered won't show publicly, but good to refresh)
    } catch (err) {
      alert(err.message);
    } finally {
      setAskLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewLoading(true);
    try {
      const res = await apiRequest('services', 'add_review', 'POST', {
        rating: reviewRating,
        comment: reviewComment.trim(),
        service_id: null
      });
      alert(res.message);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    (faq.answer && faq.answer.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredUserQas = userQas.filter(q =>
    q.question.toLowerCase().includes(search.toLowerCase()) ||
    (q.answer && q.answer.toLowerCase().includes(search.toLowerCase()))
  );

  const isLoggedIn = !!currentUser;
  const isTourist = currentUser && currentUser.user_type === 'tourist';

  return (
    <div className="animate-fade-in">
      <PageHero
        title="What can we help?"
        subtitle="Find answers to common queries about Tripzy's services, companion matches, and payments."
        badge="Help Center"
        backgroundImage={FAQ}
      />

      <div className="container pb-5">
        <div className="row g-4">

          {/* LEFT COLUMN: FAQ List, Search, & Community Q&As */}
          <div className="col-lg-8">
            {/* Search bar */}
            <div className="card glass-card border-0 p-3 shadow-sm mb-4">
              <div className="input-group rounded-pill overflow-hidden border bg-white">
                <span className="input-group-text bg-white border-0 ps-3">
                  <i className="bi bi-search text-emerald"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 py-2 ps-2"
                  placeholder="Search FAQs and community questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ boxShadow: 'none', outline: 'none' }}
                />
              </div>
            </div>

            {/* System FAQs Accordion */}
            <h5 className="fw-bold text-gradient mb-3">
              <i className="bi bi-shield-fill-check me-2"></i>Official System FAQs
            </h5>
            {loading ? (
              <div className="text-center py-4 mb-5">
                <div className="spinner-border text-emerald" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filteredFaqs.length > 0 ? (
              <div className="accordion shadow-sm rounded-4 overflow-hidden border border-light mb-5" id="faqAccordion">
                {filteredFaqs.map((faq, index) => (
                  <div className="accordion-item border-0 border-bottom" key={faq.id}>
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <button
                        className={`accordion-button fw-bold py-3 ${index !== 0 ? 'collapsed' : ''}`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                        aria-expanded={index === 0 ? 'true' : 'false'}
                        aria-controls={`collapse${index}`}
                        style={{
                          color: index === 0 ? 'var(--primary-color)' : 'var(--text-color)',
                          background: index === 0 ? 'rgba(5, 150, 105, 0.03)' : 'var(--card-bg)'
                        }}
                      >
                        <i className="bi bi-question-circle-fill me-2 text-emerald"></i> {faq.question}
                      </button>
                    </h2>
                    <div
                      id={`collapse${index}`}
                      className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                      aria-labelledby={`heading${index}`}
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body bg-light text-muted small" style={{ lineHeight: '1.6' }}>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border rounded bg-white bg-opacity-50 mb-5">
                <p className="text-muted mb-0 small">No official FAQs found matching your search term.</p>
              </div>
            )}

            {/* SEPARATE SPACE: Community Q&A Feed (Scrollable) */}
            <div className="card glass-card border-0 p-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold text-gradient mb-0">
                    <i className="bi bi-people-fill me-2"></i>Community Q&A Feed
                  </h5>
                  <p className="text-muted small mb-0">Questions asked by travelers and answered by Tripzy administrators</p>
                </div>
                <span className="badge bg-emerald rounded-pill px-2.5 py-1.5 small" style={{ fontSize: '11px' }}>
                  {filteredUserQas.length} Answered
                </span>
              </div>

              <div
                className="pe-2"
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid var(--card-border)',
                  borderRadius: '16px',
                  padding: '16px',
                  backgroundColor: 'var(--dashboard-bg)'
                }}
              >
                {filteredUserQas.length > 0 ? (
                  <div className="d-flex flex-column gap-4">
                    {filteredUserQas.map((q) => (
                      <div key={q.id} className="border-bottom pb-4 last:border-0 last:pb-0">
                        {/* User Profile Info */}
                        <div className="d-flex align-items-center gap-2.5 mb-2">
                          <img
                            src={getProfilePhoto(q.profile_photo)}
                            alt={q.full_name}
                            className="rounded-circle border"
                            style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="fw-bold mb-0 text-dark small" style={{ fontSize: '13px' }}>{q.full_name}</h6>
                            <span className="text-muted small" style={{ fontSize: '10.5px' }}>Verified Traveler</span>
                          </div>
                        </div>

                        {/* Question Bubble */}
                        <div className="p-3 rounded-4 mb-2 ms-4" style={{ backgroundColor: 'rgba(0, 154, 167, 0.06)', borderRadius: '0 20px 20px 20px' }}>
                          <span className="fw-bold text-primary small d-block mb-1 font-monospace" style={{ fontSize: '11px' }}>QUESTION:</span>
                          <p className="mb-0 text-dark small" style={{ lineHeight: '1.5' }}>{q.question}</p>
                        </div>

                        {/* Admin Answer Bubble */}
                        <div className="p-3 rounded-4 ms-5 border border-emerald border-opacity-10" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '0 20px 20px 20px' }}>
                          <span className="fw-bold text-success small d-flex align-items-center gap-1 mb-1 font-monospace" style={{ fontSize: '11px' }}>
                            <i className="bi bi-shield-fill-check"></i> TRIPZY ADMIN RESPONSE:
                          </span>
                          <p className="mb-0 text-muted small" style={{ lineHeight: '1.5' }}>{q.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-chat-quote fs-2 text-muted opacity-50"></i>
                    <p className="text-muted mt-2 mb-0 small">No community questions answered yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (Ask Question & Leave Review) */}
          <div className="col-lg-4">

            {/* Ask Question Card */}
            <div className="card glass-card p-4 border-0 mb-4 shadow-sm">
              <h5 className="fw-bold mb-1 text-gradient">
                <i className="bi bi-chat-left-text-fill me-2"></i>Ask a Question
              </h5>
              <p className="text-muted small mb-3">Send your query directly to our admin team. Once answered, you'll receive an email notification.</p>

              {isLoggedIn ? (
                <form onSubmit={handleAskQuestion}>
                  <div className="mb-3">
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="Type your question here..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      required
                      style={{ fontSize: '13px' }}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-gradient w-100 py-2 rounded-pill shadow-sm fw-bold small"
                    disabled={askLoading}
                  >
                    {askLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending Question...
                      </>
                    ) : 'Submit Question'}
                  </button>
                </form>
              ) : (
                <div className="text-center p-3 border rounded-3 bg-light bg-opacity-50">
                  <i className="bi bi-person-fill-lock text-muted fs-3"></i>
                  <p className="small text-muted mt-2 mb-3">Please log in to submit a question so we can contact you with the answer.</p>
                  <button
                    type="button"
                    className="btn btn-outline-gradient btn-sm rounded-pill w-100 fw-bold"
                    onClick={() => onNavigate('auth')}
                  >
                    Log In to Ask
                  </button>
                </div>
              )}
            </div>

            {/* Leave Review Card */}
            <div className="card glass-card p-4 border-0 shadow-sm">
              <h5 className="fw-bold mb-1 text-gradient">
                <i className="bi bi-star-fill me-2"></i>Rate Your Experience
              </h5>
              <p className="text-muted small mb-3">Tell us how you like Tripzy! Your platform feedback helps us grow and will show on our homepage.</p>

              {isTourist ? (
                <form onSubmit={handleReviewSubmit}>
                  {/* Stars Rating Selector */}
                  <div className="d-flex justify-content-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn p-0 border-0 bg-transparent"
                        onClick={() => setReviewRating(star)}
                        style={{ outline: 'none' }}
                      >
                        <i
                          className={`bi bi-star-fill fs-3 transition-colors ${star <= reviewRating ? 'text-warning' : 'text-secondary opacity-20'
                            }`}
                          style={{ transition: 'color 0.2s', cursor: 'pointer' }}
                        ></i>
                      </button>
                    ))}
                  </div>

                  <div className="mb-3">
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="Write your review here..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      style={{ fontSize: '13px' }}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-gradient w-100 py-2 rounded-pill shadow-sm fw-bold small"
                    disabled={reviewLoading}
                  >
                    {reviewLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting Review...
                      </>
                    ) : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center p-3 border rounded-3 bg-light bg-opacity-50">
                  <i className="bi bi-shield-lock-fill text-muted fs-2"></i>
                  <p className="small text-muted mt-2 mb-3">Only logged-in tourists can submit general platform reviews.</p>
                  <button
                    type="button"
                    className="btn btn-outline-gradient btn-sm rounded-pill w-100 fw-bold"
                    onClick={() => onNavigate('auth')}
                  >
                    Login as Tourist
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
