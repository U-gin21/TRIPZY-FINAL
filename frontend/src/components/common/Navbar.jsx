import React from 'react';
import { getUploadUrl, getProfilePhoto } from '../../api';
import logo from '../../assets/logo.png';

export default function Navbar({ page, setPage, currentUser, handleLogout, setAuthMode, theme, toggleTheme }) {
  const closeNavbar = () => {
    const navbar = document.getElementById('navbarNav');
    if (navbar && navbar.classList.contains('show')) {
      if (window.bootstrap && window.bootstrap.Collapse) {
        try {
          const bsCollapse = window.bootstrap.Collapse.getInstance(navbar) || new window.bootstrap.Collapse(navbar, { toggle: false });
          bsCollapse.hide();
        } catch (e) {
          navbar.classList.remove('show');
        }
      } else {
        navbar.classList.remove('show');
      }
    }
  };

  const handleNavClick = (targetPage, e) => {
    if (e) e.preventDefault();
    setPage(targetPage);
    closeNavbar();
  };

  const handleAuthClick = (mode) => {
    setPage('auth');
    setAuthMode(mode);
    closeNavbar();
  };

  const handleLogoutClick = (e) => {
    if (e) e.preventDefault();
    handleLogout();
    closeNavbar();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top py-3">
      <div className="container">
        <a
          className="navbar-brand fw-extrabold fs-3 text-gradient d-flex align-items-center gap-2"
          href="#"
          onClick={(e) => handleNavClick('home', e)}
        >
          <img src={logo} alt="Tripzy Logo" style={{ height: '35px', width: 'auto', objectFit: 'contain' }} /> Tripzy
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-2">
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'home' ? 'active' : ''}`} href="#" onClick={(e) => handleNavClick('home', e)}>Home</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'explore' ? 'active' : ''}`} href="#" onClick={(e) => handleNavClick('explore', e)}>Explore Destinations</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'companions' ? 'active' : ''}`} href="#" onClick={(e) => handleNavClick('companions', e)}>Companion Finder</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'about' ? 'active' : ''}`} href="#" onClick={(e) => handleNavClick('about', e)}>About Us</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'faqs' ? 'active' : ''}`} href="#" onClick={(e) => handleNavClick('faqs', e)}>FAQs</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'contact' ? 'active' : ''}`} href="#" onClick={(e) => handleNavClick('contact', e)}>Contact Us</a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              className="btn btn-link nav-link-custom text-decoration-none d-flex align-items-center justify-content-center border border-secondary border-opacity-10 shadow-sm rounded-circle theme-toggle-btn"
              style={{ width: '38px', height: '38px', cursor: 'pointer', backgroundColor: 'var(--input-bg)' }}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <i className={`bi bi-${theme === 'dark' ? 'sun-fill text-warning' : 'moon-stars-fill text-secondary'} fs-5`}></i>
            </button>

            {currentUser ? (
              <div className="dropdown ms-2">
                <div
                  className="rounded-circle border overflow-hidden bg-white shadow-sm"
                  style={{ width: '38px', height: '38px', borderColor: 'var(--navbar-border)', cursor: 'pointer' }}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  title="User Panel"
                >
                  <img
                    src={getProfilePhoto(currentUser.profile_photo)}
                    alt={currentUser.full_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3" style={{ minWidth: '160px' }}>
                  <li>
                    <a className="dropdown-item fw-bold py-2 d-flex align-items-center gap-2" href="#" onClick={(e) => handleNavClick('dashboard', e)}>
                      <i className="bi bi-speedometer2 text-primary"></i> Dashboard
                    </a>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <a className="dropdown-item text-danger fw-bold py-2 d-flex align-items-center gap-2" href="#" onClick={(e) => handleLogoutClick(e)}>
                      <i className="bi bi-box-arrow-right text-danger"></i> Logout
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <button className="btn btn-outline-gradient btn-sm rounded-pill px-3 fw-bold" onClick={() => handleAuthClick('login')}>
                  Login
                </button>
                <button className="btn btn-gradient btn-sm rounded-pill px-3" onClick={() => handleAuthClick('register')}>
                  Register
                </button>
                <div
                  className="rounded-circle border d-flex align-items-center justify-content-center bg-white shadow-sm ms-1"
                  style={{ width: '38px', height: '38px', borderColor: 'var(--navbar-border)', cursor: 'pointer' }}
                  onClick={() => handleAuthClick('login')}
                >
                  <i className="bi bi-person text-secondary fs-5"></i>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
