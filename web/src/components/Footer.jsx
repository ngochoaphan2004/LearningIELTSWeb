import React from 'react';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '2rem 0', marginTop: '15px' }}>
      <div className="container" style={{ padding: '0 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', gap: '1rem' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} IELTS Social. Đã đăng ký bản quyền.</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Mail size={16} /> phanngochoa2004@gmail.com
        </p>
      </div>
    </footer>
  );
};

export default Footer;
