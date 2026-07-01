import React, { useState } from 'react';
import PageHero from '../../../components/common/PageHero';
import Contact_us_hero from '../../../assets/Contact_us_hero.jpg';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you! Your message was submitted successfully.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="animate-fade-in">
      <PageHero
        title="Contact Us"
        subtitle="Have inquiries or need assistance? Reach out to the Tripzy team. We're here to help you."
        badge="Support & Inquiries"
        backgroundImage={Contact_us_hero}
      />

      <div className="container pb-5">

        <div className="row g-5 justify-content-center">
          {/* Info Grid */}
          <div className="col-lg-5">
            <div className="card glass-card p-4 border-0 mb-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <h4 className="fw-bold mb-4 text-gradient">Get In Touch</h4>
                <div className="d-flex align-items-start gap-3 mb-4">
                  <div className="bg-success bg-opacity-10 text-success p-3 rounded-3" style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                    <i className="bi bi-geo-alt-fill fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Our Headquarters</h6>
                    <p className="text-muted small mb-0">123 Galle Road, Colombo 03, Sri Lanka</p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 mb-4">
                  <div className="bg-teal bg-opacity-10 text-teal p-3 rounded-3" style={{ background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' }}>
                    <i className="bi bi-envelope-fill fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Email Inquiry</h6>
                    <p className="text-muted small mb-0">dteugene2003@gmail.com</p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="bg-warning bg-opacity-10 text-dark p-3 rounded-3" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                    <i className="bi bi-telephone-fill fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Call Support</h6>
                    <p className="text-muted small mb-0">+94 743571412</p>
                  </div>
                </div>
              </div>

              <div className="border-top pt-4 mt-4">
                <h6 className="fw-bold mb-2">Social Channels</h6>
                <div className="d-flex gap-3">
                  <a href="#" className="btn btn-outline-success btn-sm rounded-circle"><i className="bi bi-facebook"></i></a>
                  <a href="#" className="btn btn-outline-success btn-sm rounded-circle"><i className="bi bi-instagram"></i></a>
                  <a href="#" className="btn btn-outline-success btn-sm rounded-circle"><i className="bi bi-twitter-x"></i></a>
                  <a href="#" className="btn btn-outline-success btn-sm rounded-circle"><i className="bi bi-youtube"></i></a>
                </div>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="col-lg-6">
            <div className="card glass-card p-4 border-0">
              <h4 className="fw-bold mb-4 text-gradient">Send a Message</h4>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Your Name</label>
                  <input
                    type="text"
                    className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Ama Silva"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Email Address</label>
                  <input
                    type="email"
                    className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Subject</label>
                  <input
                    type="text"
                    className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="How can we help?"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Your Message</label>
                  <textarea
                    className="form-control rounded-3 border-light-subtle shadow-sm"
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Type your message here..."
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-gradient w-100 py-2 btn-lg mt-2 shadow-sm">
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
