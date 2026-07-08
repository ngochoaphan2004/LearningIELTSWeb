import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, FileText, Loader, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNav from '../components/TopNav';
import apiClient from '../config/axios';

const TIME_ALLOCATIONS = [
  {
    title: "Nguồn đầu vào",
    fraction: 1/4,
    fractionText: "1/4 thời gian",
    action: "Đọc 1 đoạn ngắn hoặc xem transcript",
    desc: "Tập trung vào việc hiểu ngữ cảnh, cách dùng từ vựng mới và cấu trúc câu trong bài. Ghi chú lại các từ vựng hoặc cụm từ hay."
  },
  {
    title: "Kỹ năng chính",
    fraction: 1/3,
    fractionText: "1/3 thời gian",
    action: "Làm 1 bài tập vi mô",
    desc: "Viết 1 đoạn Body, hoặc ghi âm 1 Part Speaking, hoặc giải 1 passage Reading."
  },
  {
    title: "Sửa ngôn ngữ",
    fraction: 1/4,
    fractionText: "1/4 thời gian",
    action: "Sửa 3 lỗi grammar/vocabulary",
    desc: "Sử dụng từ điển hoặc công cụ kiểm tra ngữ pháp để xem lại các lỗi sai. Ghi chú lại nguyên nhân sai và cách khắc phục để tránh lặp lại."
  },
  {
    title: "Rà lại",
    fraction: 1/6,
    fractionText: "1/6 thời gian",
    action: "Điền từ vựng vào Sổ A, điền lỗi sai vào Bảng lỗi, nhẩm lại kiến thức.",
    desc: "Đưa các từ vựng, cấu trúc và lỗi sai vào sổ tay. Ôn tập lại các flashcard đến hạn trong ngày để củng cố trí nhớ."
  }
];

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

  // Thêm state cho Notebook
  const [notebookData, setNotebookData] = useState({
    vocabItems: [{ phrase: '', meaning: '', example_sentence: '', errors_in_sentence: '' }],
    writingContent: '',
    writingErrors: '',
    dictationAudio: '',
    dictationText: ''
  });

  const handleAddVocab = () => {
    setNotebookData(prev => ({
      ...prev,
      vocabItems: [...prev.vocabItems, { phrase: '', meaning: '', example_sentence: '', errors_in_sentence: '' }]
    }));
  };

  const handleRemoveVocab = (index) => {
    setNotebookData(prev => ({
      ...prev,
      vocabItems: prev.vocabItems.filter((_, i) => i !== index)
    }));
  };

  const handleVocabChange = (index, field, value) => {
    const newItems = [...notebookData.vocabItems];
    newItems[index][field] = value;
    setNotebookData(prev => ({ ...prev, vocabItems: newItems }));
  };

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
      let payloadNotebook = null;
      const skill = sessionData?.focus_skill || '';
      
      if (skill.includes('Từ vựng') || skill.includes('Reading')) {
        const validItems = notebookData.vocabItems.filter(i => i.phrase.trim() !== '');
        if (validItems.length > 0) {
          payloadNotebook = { type: 'VOCABULARY', items: validItems };
        }
      } else if (skill.includes('Writing')) {
        if (notebookData.writingContent.trim()) {
          payloadNotebook = { 
            type: 'WRITING', 
            content_submitted: notebookData.writingContent, 
            errors_found: notebookData.writingErrors 
          };
        }
      } else if (skill.includes('Listening')) {
        if (notebookData.dictationText.trim()) {
          payloadNotebook = { 
            type: 'DICTATION', 
            audio_link: notebookData.dictationAudio, 
            dictation_text: notebookData.dictationText 
          };
        }
      }

      await apiClient.post('/api/sessions/complete', { 
        sessionId: id,
        notebookData: payloadNotebook
      });
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

              {/* NEW BOX FOR TIME ALLOCATIONS */}
              <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>GỢI Ý PHÂN BỔ THỜI GIAN</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {TIME_ALLOCATIONS.map((item, index) => {
                    const minutes = Math.round(sessionData.duration_minutes * item.fraction);
                    return (
                      <div key={index} style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>{item.title}</strong>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            ~{minutes}p
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{item.action}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
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

          {/* Right Panel: Notebook Form */}
          <div className="focus-right-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            
            {/* Box mở tài liệu */}
            {activePdf && (
              <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} color="var(--accent-primary)" />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Tài liệu bài học</span>
                </div>
                <a href={activePdf} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                  <ExternalLink size={16} /> Mở tài liệu ở tab mới
                </a>
              </div>
            )}

            {/* Form điền bài */}
            <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: 700, borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem' }}>Báo cáo Bài làm</h3>
              
              {(!sessionData.focus_skill || (sessionData.focus_skill.includes('Từ vựng') || sessionData.focus_skill.includes('Reading'))) && (
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>Điền các từ vựng mới hoặc cấu trúc bạn học được vào đây để tự động lưu vào Sổ Từ Vựng.</p>
                  
                  {notebookData.vocabItems.map((item, index) => (
                    <div key={index} style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem', position: 'relative', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cụm từ / Từ vựng <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                          <input type="text" className="form-control" value={item.phrase} onChange={e => handleVocabChange(index, 'phrase', e.target.value)} placeholder="VD: Have a knack for..." style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', transition: 'border 0.2s' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nghĩa <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                          <input type="text" className="form-control" value={item.meaning} onChange={e => handleVocabChange(index, 'meaning', e.target.value)} placeholder="VD: Có năng khiếu về..." style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', transition: 'border 0.2s' }} />
                        </div>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Câu ví dụ</label>
                        <input type="text" className="form-control" value={item.example_sentence} onChange={e => handleVocabChange(index, 'example_sentence', e.target.value)} placeholder="Viết một câu áp dụng từ vựng này..." style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', transition: 'border 0.2s' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#991b1b' }}>Lỗi sai trong câu (Nếu có)</label>
                        <input type="text" className="form-control" value={item.errors_in_sentence} onChange={e => handleVocabChange(index, 'errors_in_sentence', e.target.value)} placeholder="Ghi chú lại lỗi grammar/vocab đã mắc phải..." style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fef2f2', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', color: '#991b1b' }} />
                      </div>
                      
                      {notebookData.vocabItems.length > 1 && (
                        <button onClick={() => handleRemoveVocab(index)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', border: '1px solid var(--border-light)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }} title="Xóa từ này">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button onClick={handleAddVocab} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                    <Plus size={18} /> Thêm từ vựng mới
                  </button>
                </div>
              )}

              {sessionData.focus_skill?.includes('Writing') && (
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>Lưu trữ bài viết của bạn và các lỗi sai đã sửa để xem lại trong Bảng Lỗi.</p>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Đoạn văn đã viết <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                    <textarea 
                      className="form-control" 
                      rows={12} 
                      value={notebookData.writingContent} 
                      onChange={e => setNotebookData({...notebookData, writingContent: e.target.value})} 
                      placeholder="Nhập hoặc dán bài viết của bạn vào đây..." 
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical', outline: 'none', fontFamily: 'inherit', fontSize: '1rem', lineHeight: 1.6, background: 'var(--bg-secondary)' }} 
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#991b1b' }}>Các lỗi sai đã phát hiện</label>
                    <textarea 
                      className="form-control" 
                      rows={6} 
                      value={notebookData.writingErrors} 
                      onChange={e => setNotebookData({...notebookData, writingErrors: e.target.value})} 
                      placeholder="Liệt kê các lỗi sai và cách sửa để rút kinh nghiệm..." 
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fef2f2', resize: 'vertical', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: 1.6, color: '#991b1b' }} 
                    />
                  </div>
                </div>
              )}

              {sessionData.focus_skill?.includes('Listening') && (
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>Ghi chép chính tả và lưu link audio để có thể nghe lại dễ dàng sau này.</p>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Link Audio (YouTube, Drive...)</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      value={notebookData.dictationAudio} 
                      onChange={e => setNotebookData({...notebookData, dictationAudio: e.target.value})} 
                      placeholder="https://..." 
                      style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', background: 'var(--bg-secondary)' }} 
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Đoạn văn chép chính tả <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                    <textarea 
                      className="form-control" 
                      rows={14} 
                      value={notebookData.dictationText} 
                      onChange={e => setNotebookData({...notebookData, dictationText: e.target.value})} 
                      placeholder="Gõ nội dung bạn nghe được vào đây..." 
                      style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical', outline: 'none', fontFamily: 'inherit', fontSize: '1rem', lineHeight: 1.6, background: 'var(--bg-secondary)' }} 
                    />
                  </div>
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
