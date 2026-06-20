import { useState, useEffect } from 'react';
import logo from '../../../assets/logo.png';
import { authService } from '../../../services/authService';
import './Auth.css';

// Components
import ForgotPasswordForm from './components/ForgotPasswordForm';
import VerifyOtpForm from './components/VerifyOtpForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

export default function Auth({ onLoginSuccess, initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('tourist'); // tourist, provider, admin
  const [fullName, setFullName] = useState('');
  const [nicPassport, setNicPassport] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Forgot / Reset Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verifyMode, setVerifyMode] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLogin(initialMode === 'login');
      setForgotMode(false);
      setResetMode(false);
      setVerifyMode(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialMode]);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login(loginEmail, loginPassword);
      alert(res.message);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 1000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    const numericRegex = /^\d+$/;
    if (numericRegex.test(fullName)) {
      alert('Full name cannot consist only of numbers.');
      setLoading(false);
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(contactNo)) {
      alert('Contact number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!gender) {
      alert('Please select your gender.');
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      alert('You must agree to the Terms of Service & Privacy Policy.');
      setLoading(false);
      return;
    }

    // Validate age
    const age = calculateAge(dob);
    if (age < 18) {
      alert('Registration restricted: You must be at least 18 years old.');
      setLoading(false);
      return;
    }

    // Auto-generate name_with_initial from full_name
    const nameParts = fullName.trim().split(/\s+/);
    const generatedInitials = nameParts.length > 1
      ? nameParts.slice(0, -1).map(p => p[0].toUpperCase() + '.').join(' ') + ' ' + nameParts[nameParts.length - 1]
      : fullName;

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('user_type', userType);
      formData.append('full_name', fullName);
      formData.append('name_with_initial', generatedInitials);
      formData.append('nic_passport', nicPassport);
      formData.append('contact_no', contactNo);
      formData.append('gender', gender);
      formData.append('date_of_birth', dob);
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }

      const res = await authService.register(formData);
      alert(res.message + ' Please log in now.');
      setTimeout(() => {
        setIsLogin(true);
      }, 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.forgotPassword(resetEmail);
      alert(res.message);
      setVerifyMode(true);
      setForgotMode(false);
      setResetMode(false);
      setOtpVerified(false);
      setResetToken('');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.verifyResetToken(resetToken);
      alert(res.message);
      setVerifyMode(false);
      setResetMode(true);
      setOtpVerified(true);
      setResetToken('');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!otpVerified) {
        throw new Error('Please verify your OTP before resetting your password.');
      }
      const res = await authService.resetPassword(newPassword);
      alert(res.message);
      setTimeout(() => {
        setResetMode(false);
        setIsLogin(true);
      }, 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container py-5 px-3">
      {/* Decorative Background Blobs */}
      <div className="auth-bg-blob-1"></div>
      <div className="auth-bg-blob-2"></div>

      <div className="container my-auto">
        <div className="row justify-content-center">
          <div className={isLogin || forgotMode || resetMode || verifyMode ? "col-12 col-md-6 col-lg-5" : "col-12 col-lg-9 col-xl-8"}>
            <div className="card auth-form-card p-4 p-md-5 border-0 animate-fade-in">
              
              {/* FORGOT PASSWORD SECTION */}
              {forgotMode && (
                <ForgotPasswordForm
                  resetEmail={resetEmail}
                  setResetEmail={setResetEmail}
                  handleForgotPassword={handleForgotPassword}
                  loading={loading}
                  setForgotMode={setForgotMode}
                  setIsLogin={setIsLogin}
                />
              )}

              {/* VERIFY OTP SECTION */}
              {verifyMode && (
                <VerifyOtpForm
                  resetToken={resetToken}
                  setResetToken={setResetToken}
                  handleVerifyToken={handleVerifyToken}
                  loading={loading}
                  setVerifyMode={setVerifyMode}
                  setForgotMode={setForgotMode}
                />
              )}

              {/* RESET PASSWORD SECTION */}
              {resetMode && (
                <ResetPasswordForm
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  handleResetPassword={handleResetPassword}
                  loading={loading}
                />
              )}

              {/* LOGIN FORM SECTION */}
              {isLogin && !forgotMode && !resetMode && !verifyMode && (
                <LoginForm
                  loginEmail={loginEmail}
                  setLoginEmail={setLoginEmail}
                  loginPassword={loginPassword}
                  setLoginPassword={setLoginPassword}
                  handleLogin={handleLogin}
                  setForgotMode={setForgotMode}
                  setIsLogin={setIsLogin}
                  setResetEmail={setResetEmail}
                  loading={loading}
                />
              )}

              {/* REGISTER FORM SECTION */}
              {!isLogin && !forgotMode && !resetMode && !verifyMode && (
                <RegisterForm
                  userType={userType}
                  setUserType={setUserType}
                  fullName={fullName}
                  setFullName={setFullName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  dob={dob}
                  setDob={setDob}
                  gender={gender}
                  setGender={setGender}
                  nicPassport={nicPassport}
                  setNicPassport={setNicPassport}
                  contactNo={contactNo}
                  setContactNo={setContactNo}
                  agreeToTerms={agreeToTerms}
                  setAgreeToTerms={setAgreeToTerms}
                  handleRegister={handleRegister}
                  loading={loading}
                  setIsLogin={setIsLogin}
                  profilePhoto={profilePhoto}
                  setProfilePhoto={setProfilePhoto}
                />
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
