import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

const TopNav = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  return (
    <nav className="top-nav" style={{ position: 'relative' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>IELTS Social</div>
        
        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px' }}>Đăng xuất</button>
        </div>

        {/* Mobile Hamburger */}
        <div className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ cursor: 'pointer', color: 'var(--text-primary)' }}>
          <Menu size={28} />
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: '0', background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid var(--border-light)', zIndex: 100, minWidth: '150px' }}>
            <button onClick={handleLogout} className="btn" style={{ width: '100%', padding: '0.5rem 1rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px' }}>Đăng xuất</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNav;
