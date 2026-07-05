import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNav from '../components/TopNav';

const FocusMode = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    // Finish session and go back to dashboard
    navigate('/');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <TopNav />
      {/* Top Bar Minimal */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ padding: '1rem 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate('/')} className="btn btn-outline" style={{ border: 'none' }}>
            <ArrowLeft size={20} /> Quay lại
          </button>
          <div style={{ fontWeight: '600' }}>Buổi học 14: Reading Part 2</div>
          <div style={{ width: '100px' }}></div> {/* Spacer for centering */}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ display: 'flex', height: '100%', padding: '0 20px' }}>
          {/* Left Panel: Activity Info & Timer */}
          <div style={{ width: '350px', padding: '2rem 2rem 2rem 0', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '1.5rem', textAlign: 'center', background: 'var(--bg-primary)' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>THỜI GIAN CÒN LẠI</h3>
              <div style={{ fontSize: '4rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-primary)', marginBottom: '1rem', textShadow: 'var(--shadow-glow)' }}>
                {formatTime(timeLeft)}
              </div>
              <button onClick={toggleTimer} className={`btn ${isActive ? 'btn-outline' : 'btn-primary'}`} style={{ width: '100%' }}>
                <Clock size={18} /> {isActive ? 'Tạm dừng' : 'Bắt đầu tính giờ'}
              </button>
            </div>

            <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', flex: 1, animationDelay: '100ms', background: 'var(--bg-primary)' }}>
              <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
                Kỹ năng: READING
              </div>
              <h2 style={{ marginBottom: '1rem' }}>Hướng dẫn hoạt động</h2>
              <p style={{ marginBottom: '1.5rem' }}>
                1. Đọc lướt nhanh bài viết bên phải để lấy ý chính (Skimming).<br/><br/>
                2. Đọc kỹ từng câu hỏi True/False/Not Given.<br/><br/>
                3. Quét bài viết để tìm từ khóa (Scanning).<br/><br/>
                4. Cẩn thận bẫy Not Given (Không được đề cập trong bài).
              </p>
              
              <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <button onClick={handleComplete} className="btn" style={{ width: '100%', background: 'var(--accent-success)', color: 'white' }}>
                  <CheckCircle size={18} /> Hoàn thành buổi học
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: PDF Placeholder */}
          <div style={{ flex: 1, padding: '2rem 0 2rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel flex-center" style={{ width: '100%', height: '100%', border: '2px dashed var(--border-color)', background: 'var(--bg-primary)', flexDirection: 'column', color: 'var(--text-secondary)' }}>
              <FileText size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Trình xem Tài Liệu</h3>
              <p>Tài liệu bài tập Reading sẽ được nhúng vào khu vực này.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '1rem', opacity: 0.7 }}>File: Reading_Part2_TFN.pdf</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
