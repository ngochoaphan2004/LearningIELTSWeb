import React, { useState } from 'react';
import { LogIn, BookOpen, Target, Users, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, firebaseConfig } from '../config/firebase';

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    
    if (!auth || firebaseConfig.apiKey === "YOUR_API_KEY") {
      setErrorMsg("Chưa cấu hình Firebase! Hãy cập nhật src/config/firebase.js");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Bước 1: Mở popup cho người dùng đăng nhập bằng tài khoản Google
      const result = await signInWithPopup(auth, googleProvider);
      
      // Lấy idToken từ Firebase
      const idToken = await result.user.getIdToken();

      // Bước 2: Bắn idToken này xuống Backend để đồng bộ Database
      const response = await fetch('http://localhost:3000/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) {
        throw new Error('Không thể đồng bộ với hệ thống IELTS');
      }

      // Đăng nhập và lưu DB thành công -> Chuyển vào Dashboard
      navigate('/');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Đã có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setErrorMsg("Chức năng Email đang phát triển. Hãy Đăng nhập bằng Google!");
  };

  return (
    <div className="auth-wrapper" style={{ background: 'var(--bg-secondary)', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ display: 'flex', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', minHeight: '600px', padding: 0, background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
        {/* Cột trái: Trực quan, truyền cảm hứng (Ẩn trên điện thoại) */}
        <div className="auth-hero">
          <div className="hero-content animate-fade-in">
            <div className="brand-logo">
              <BookOpen size={40} className="text-white" />
              <h1 className="hero-title">IELTS Social</h1>
            </div>
            <p className="hero-subtitle">Mạng lưới học tập & theo dõi tiến độ thông minh dành riêng cho chiến binh IELTS.</p>
            
            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon"><Target size={20} /></div>
                <span style={{ fontWeight: 500 }}>Lộ trình cá nhân hóa</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Users size={20} /></div>
                <span style={{ fontWeight: 500 }}>Cộng đồng cùng tiến</span>
              </div>
            </div>
          </div>
          <div className="hero-overlay"></div>
        </div>

        {/* Cột phải: Form Đăng nhập */}
        <div className="auth-form-container">
          <div className="auth-card animate-fade-in" style={{ border: 'none', boxShadow: 'none' }}>
            <div className="text-center mb-8 mobile-brand">
              <h1 className="nav-brand text-3xl mb-2">Xin chào! 👋</h1>
              <p className="text-secondary">Đăng nhập để tiếp tục hành trình của bạn</p>
            </div>

            {errorMsg && (
              <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn google-btn flex-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Tiếp tục với Google
            </button>

            <div className="divider">
              <span>HOẶC BẰNG EMAIL</span>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="input-group">
                <label>Email</label>
                <input type="email" placeholder="nhap@email.com" className="input-field" required />
              </div>
              <div className="input-group">
                <label>Mật khẩu</label>
                <input type="password" placeholder="••••••••" className="input-field" required />
              </div>
              
              <div className="flex justify-between items-center text-sm mt-4 mb-6">
                <label className="flex items-center gap-2 cursor-pointer text-secondary hover-text-primary">
                  <input type="checkbox" style={{ accentColor: 'var(--accent-primary)' }} /> Ghi nhớ
                </label>
                <a href="#" className="text-primary font-medium">Quên mật khẩu?</a>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                <LogIn size={18} /> Đăng nhập
              </button>
            </form>
            
            <p className="text-center text-sm text-secondary mt-6">
              Chưa có tài khoản? <a href="#" className="text-primary font-medium" style={{ textDecoration: 'none' }}>Đăng ký ngay</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
