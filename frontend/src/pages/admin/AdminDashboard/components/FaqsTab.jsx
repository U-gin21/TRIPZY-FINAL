import React, { useState } from 'react';
import { apiRequest } from '../../../../api';

export default function FaqsTab({ faqs, fetchFaqs, showConfirm }) {
  // FAQ Creation State
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // FAQ Editing State
  const [editingId, setEditingId] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState('');
  const [editingAnswer, setEditingAnswer] = useState('');

  const handleCreateFaq = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('faqs', 'create', 'POST', {
        question: faqQuestion,
        answer: faqAnswer
      });
      alert("FAQ created successfully!");
      setFaqQuestion('');
      setFaqAnswer('');
      fetchFaqs();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (faq) => {
    setEditingId(faq.id);
    setEditingQuestion(faq.question);
    setEditingAnswer(faq.answer || '');
  };

  const handleUpdateFaq = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('faqs', 'update', 'POST', {
        id: editingId,
        question: editingQuestion,
        answer: editingAnswer
      });
      alert("FAQ updated successfully!");
      setEditingId(null);
      fetchFaqs();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteFaq = (id) => {
    showConfirm(
      "Delete this FAQ?",
      async () => {
        try {
          await apiRequest('faqs', 'delete', 'POST', { id });
          alert("FAQ deleted.");
          fetchFaqs();
        } catch (err) {
          alert(err.message);
        }
      },
      "Delete FAQ"
    );
  };

  return (
    <div>
      <h2 className="fw-bold text-gradient mb-4">FAQ Management</h2>
      <div className="row g-4">
        {/* Form to Create FAQ */}
        <div className="col-md-4">
          <div className="card glass-card p-4 border-0 shadow-sm">
            <h5 className="fw-bold mb-3 text-gradient">Add FAQ Item</h5>
            <form onSubmit={handleCreateFaq}>
              <div className="mb-3">
                <label className="form-label small fw-bold">FAQ Question</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  value={faqQuestion} 
                  onChange={(e) => setFaqQuestion(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">FAQ Answer</label>
                <textarea 
                  className="form-control rounded-3" 
                  rows="4" 
                  value={faqAnswer} 
                  onChange={(e) => setFaqAnswer(e.target.value)} 
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-gradient w-100 py-2 rounded-pill shadow-sm">Save FAQ</button>
            </form>
          </div>
        </div>
        
        {/* List of System FAQs */}
        <div className="col-md-8">
          <div className="card glass-card p-4 border-0 shadow-sm">
            <h5 className="fw-bold mb-3 text-gradient">System FAQs</h5>
            <div className="list-group list-group-flush" style={{ maxHeight: '550px', overflowY: 'auto' }}>
              {faqs.length > 0 ? (
                faqs.map(f => {
                  const isEditing = editingId === f.id;
                  const isUnanswered = !f.answer || f.answer.trim() === '';

                  return (
                    <div className="list-group-item bg-transparent px-0 py-3" key={f.id}>
                      {isEditing ? (
                        <form onSubmit={handleUpdateFaq} className="border p-3 rounded bg-light bg-opacity-50">
                          <div className="mb-2">
                            <label className="form-label small fw-bold">Question</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm rounded-3" 
                              value={editingQuestion} 
                              onChange={(e) => setEditingQuestion(e.target.value)} 
                              required 
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label small fw-bold">Answer / Response</label>
                            <textarea 
                              className="form-control form-control-sm rounded-3" 
                              rows="3" 
                              value={editingAnswer} 
                              onChange={(e) => setEditingAnswer(e.target.value)} 
                              required
                            ></textarea>
                          </div>
                          <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-emerald btn-sm rounded-pill px-3 text-white" style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>Save Response</button>
                            <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                              <h6 className="fw-bold mb-0 text-dark">{f.question}</h6>
                              {isUnanswered ? (
                                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-0.5" style={{ fontSize: '10px' }}>
                                  Pending Response
                                </span>
                              ) : f.user_id ? (
                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-0.5" style={{ fontSize: '10px' }}>
                                  User Q&A
                                </span>
                              ) : (
                                <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 py-0.5" style={{ fontSize: '10px' }}>
                                  System FAQ
                                </span>
                              )}
                            </div>
                            {f.user_name && (
                              <div className="text-secondary mb-1" style={{ fontSize: '11.5px', fontWeight: '600' }}>
                                <i className="bi bi-person-fill text-primary me-1"></i> Submitted by: {f.user_name} ({f.user_email})
                              </div>
                            )}
                            <p className={`small mb-0 ${isUnanswered ? 'text-danger italic small font-monospace' : 'text-muted'}`}>
                              {isUnanswered ? '⚠️ Awaiting administrator answer...' : f.answer}
                            </p>
                          </div>
                          
                          <div className="d-flex gap-2 ms-3">
                            <button 
                              className={`btn btn-sm rounded-circle ${isUnanswered ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                              onClick={() => startEdit(f)}
                              title={isUnanswered ? "Answer Question" : "Edit FAQ"}
                              style={isUnanswered ? { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } : {}}
                            >
                              <i className={`bi ${isUnanswered ? 'bi-check-circle-fill' : 'bi-pencil'}`}></i>
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm rounded-circle" 
                              onClick={() => handleDeleteFaq(f.id)} 
                              title="Delete FAQ"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No system FAQs have been created yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
