import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, FileText, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNav from '../components/TopNav';
import apiClient from '../config/axios';

const FocusMode = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [activePdf, setActivePdf] = useState(null);

  const getEmbedUrl = (url) => {
    if (!url) return url;
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/(drive\.google\.com\/file\/d\/[^\/]+)/);
      if (match) {
        return `https://${match[1]}/preview`;
      }
    }
    return url;
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        let fetchId = id;
        if (id === 'current') {
          const dashRes = await apiClient.get('/api/users/me/dashboard');
          if (dashRes.data.next_session) {
            fetchId = dashRes.data.next_session.id;
            navigate(`/session/${fetchId}`, { replace: true });
          } else {
            setLoading(false);
            return;
          }
        }
        
        const res = await apiClient.get(`/api/sessions/${fetchId}`);
        setSessionData(res.data);
        setActivePdf(res.data.embedded_url || (res.data.reference_pdfs && res.data.reference_pdfs.length > 0 ? res.data.reference_pdfs[0] : null));
        
        if (res.data.started_at) {
          const elapsed = Math.floor((Date.now() - new Date(res.data.started_at).getTime()) / 1000);
          const remaining = Math.max(0, res.data.duration_minutes * 60 - elapsed);
          setTimeLeft(remaining);
          setIsActive(remaining > 0);
        } else {
          setTimeLeft(res.data.duration_minutes * 60);
          setIsActive(false);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id, navigate]);

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

  const handleStart = async () => {
    setActionLoading(true);
    try {
      const res = await apiClient.post(`/api/sessions/${id}/start`);
      const startedAt = res.data.progress.started_at;
      setSessionData(prev => ({ ...prev, started_at: startedAt }));
      setIsActive(true);
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      setTimeLeft(Math.max(0, sessionData.duration_minutes * 60 - elapsed));
    } catch (error) {
      console.error("Error starting session", error);
      setModalState({ isOpen: true, type: 'error', message: 'Không thể bắt đầu buổi học. Vui lòng thử lại.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    setConfirmModal({ isOpen: false });
    setActionLoading(true);
    try {
      await apiClient.post(`/api/sessions/${id}/reset`);
      setSessionData(prev => ({ ...prev, started_at: null }));
      setIsActive(false);
      setTimeLeft(sessionData.duration_minutes * 60);
    } catch (error) {
      console.error("Error resetting session", error);
      setModalState({ isOpen: true, type: 'error', message: 'Không thể đặt lại buổi học. Vui lòng thử lại.' });
    } finally {
      setActionLoading(false);
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = async () => {
    try {
      await apiClient.post('/api/sessions/complete', { sessionId: id });
      navigate('/');
    } catch (error) {
      console.error("Error completing session:", error);
      const errorMsg = error.response?.data?.error || "Đã xảy ra lỗi khi lưu kết quả!";
      setModalState({ isOpen: true, type: 'error', message: errorMsg });
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
        <TopNav />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Loader className="spin" size={40} color="var(--accent-primary)" />
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
        <TopNav />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Không tìm thấy buổi học!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <TopNav />
      {/* Top Bar Minimal */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ padding: '1rem 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={() => navigate('/')} className="btn btn-outline" style={{ border: 'none', padding: '0.5rem 0' }}>
            <ArrowLeft size={20} /> Quay lại
          </button>
          <div style={{ fontWeight: '700', fontSize: '1.15rem', color: 'var(--text-primary)', textAlign: 'right' }}>
            <span style={{ color: 'var(--accent-primary)', marginRight: '0.25rem' }}>Day {sessionData.day_number}:</span>
            <span style={{ opacity: 0.9 }}>Tuần {sessionData.week_number}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
        <div className="container focus-layout-container" style={{ display: 'flex', gap: '2rem', height: '100%', padding: '2rem 20px' }}>
          {/* Left Panel: Activity Info & Timer */}
          <div className="focus-left-panel" style={{ width: '350px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '1.5rem', textAlign: 'center', background: 'var(--bg-primary)' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>THỜI GIAN CÒN LẠI</h3>
              <div className="focus-timer-text" style={{ fontSize: '4rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-primary)', marginBottom: '1rem', textShadow: 'var(--shadow-glow)' }}>
                {formatTime(timeLeft)}
              </div>
              {sessionData.started_at || isActive ? (
                <button onClick={() => setConfirmModal({ isOpen: true })} className="btn btn-outline" style={{ width: '100%' }} disabled={actionLoading}>
                  <Clock size={18} /> {actionLoading ? <Loader size={18} className="spin" /> : 'Bắt đầu lại'}
                </button>
              ) : (
                <button onClick={handleStart} className="btn btn-primary" style={{ width: '100%' }} disabled={actionLoading}>
                  <Clock size={18} /> {actionLoading ? <Loader size={18} className="spin" /> : 'Bắt đầu tính giờ'}
                </button>
              )}
            </div>

            <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', flex: 1, animationDelay: '100ms', background: 'var(--bg-primary)' }}>
              <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
                Kỹ năng: {sessionData.focus_skill || 'Ôn Tập'}
              </div>
              <h2 style={{ marginBottom: '1rem' }}>Hoạt động</h2>
              <p style={{ marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
                {sessionData.activity_description}
              </p>
              
              {/* NEW BOX FOR REFERENCE PDFs */}
              {sessionData.reference_pdfs && sessionData.reference_pdfs.length > 0 && (
                <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>NỘI DUNG TÌM KIẾM</h4>
                  <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-primary)', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {sessionData.reference_pdfs.map((str, index) => (
                      <li key={index} style={{ wordBreak: 'break-word', lineHeight: 1.5 }}>
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                {timeLeft <= (sessionData.duration_minutes * 60) / 2 ? (
                  <button onClick={handleComplete} className="btn" style={{ width: '100%', background: 'var(--accent-success)', color: 'white' }}>
                    <CheckCircle size={18} /> Hoàn thành buổi học
                  </button>
                ) : (
                  <>
                    <div style={{ fontSize: '0.85rem', color: '#d97706', textAlign: 'center', marginBottom: '0.75rem', fontWeight: 500 }}>
                      * Cần học tối thiểu 50% thời gian
                    </div>
                    <button disabled className="btn" style={{ width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'not-allowed', border: '1px solid var(--border-color)', opacity: 0.7 }}>
                      <CheckCircle size={18} opacity={0.5} /> Hoàn thành buổi học
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: PDF/Embedded View */}
          <div className="focus-right-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', minHeight: '500px', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
              {activePdf ? (
                <iframe 
                  src={getEmbedUrl(activePdf)} 
                  title="Tài liệu đính kèm"
                  style={{ flex: 1, width: '100%', height: '100%', border: 'none' }}
                  allowFullScreen
                />
              ) : (
                <div className="flex-center" style={{ width: '100%', height: '100%', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                  <FileText size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Tài liệu đính kèm</h3>
                  <p>Không có tài liệu đính kèm cho buổi học này.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal Overlay */}
      {modalState.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ background: 'var(--bg-primary)', padding: '2.5rem', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            {modalState.type === 'success' ? (
              <CheckCircle size={64} color="var(--accent-success)" style={{ margin: '0 auto 1.5rem' }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', fontWeight: 'bold' }}>!</div>
            )}
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: 'var(--text-primary)' }}>{modalState.type === 'success' ? 'Thành công!' : 'Lỗi'}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>{modalState.message}</p>
            <button className="btn btn-primary" onClick={() => setModalState({ ...modalState, isOpen: false })} style={{ width: '100%', padding: '0.85rem' }}>
              Đóng
            </button>
          </div>
        </div>
      )}
      
      {/* Confirm Modal Overlay */}
      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ background: 'var(--bg-primary)', padding: '2.5rem', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem', fontWeight: 'bold' }}>?</div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: 'var(--text-primary)' }}>Xác nhận</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>Bạn có chắc chắn muốn bắt đầu lại phiên học? Toàn bộ thời gian đã học sẽ bị hủy.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setConfirmModal({ isOpen: false })} style={{ flex: 1, padding: '0.85rem' }}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleReset} style={{ flex: 1, padding: '0.85rem', background: '#d97706', border: 'none', color: 'white' }}>
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;
