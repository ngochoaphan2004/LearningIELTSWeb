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
        <div className="desktop-menu" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div onClick={() => navigate('/')} className="nav-link-hover" style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>Home</div>
          <div onClick={() => navigate('/courses')} className="nav-link-hover" style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>Courses</div>
          <div onClick={() => navigate('/my-courses')} className="nav-link-hover" style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>My Courses</div>
          <div onClick={() => navigate('/notebooks')} className="nav-link-hover" style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>Notebooks</div>
          <div onClick={() => navigate('/session/current')} className="nav-link-hover" style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>Focus Mode</div>
          
          <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem 1.25rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '8px', fontWeight: 600, boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)' }}>Logout</button>
        </div>

        {/* Mobile Hamburger */}
        <div className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ cursor: 'pointer', color: 'var(--text-primary)' }}>
          <Menu size={28} />
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown" style={{ position: 'absolute', top: 'calc(100% + 10px)', right: '0', background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid var(--border-light)', zIndex: 100, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div onClick={() => { navigate('/'); setMobileMenuOpen(false); }} style={{ padding: '0.75rem', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)' }}>Home</div>
            <div onClick={() => { navigate('/courses'); setMobileMenuOpen(false); }} style={{ padding: '0.75rem', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)' }}>Courses</div>
            <div onClick={() => { navigate('/my-courses'); setMobileMenuOpen(false); }} style={{ padding: '0.75rem', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)' }}>My Courses</div>
            <div onClick={() => { navigate('/notebooks'); setMobileMenuOpen(false); }} style={{ padding: '0.75rem', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)' }}>Notebooks</div>
            <div onClick={() => { navigate('/session/current'); setMobileMenuOpen(false); }} style={{ padding: '0.75rem', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>Focus Mode</div>
            <button onClick={handleLogout} className="btn" style={{ width: '100%', padding: '0.5rem 1rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontWeight: 600, marginTop: '0.5rem' }}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNav;
