import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, CheckCircle, Play, Loader, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import apiClient from '../config/axios';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [modalState, setModalState] = useState({ isOpen: false, type: '', message: '' });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await apiClient.get(`/api/courses/${id}`);
        setCourse(res.data);
      } catch (error) {
        console.error("Error fetching course detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await apiClient.post(`/api/courses/${id}/enroll`);
      setModalState({ isOpen: true, type: 'success', message: 'Đăng ký khóa học thành công! Lộ trình đã được thêm vào khóa học của bạn.' });
      setCourse(prev => ({ ...prev, is_enrolled: true }));
    } catch (error) {
      console.error("Error enrolling course", error);
      setModalState({ isOpen: true, type: 'error', message: 'Bạn đã đăng ký khóa học này hoặc có lỗi xảy ra.' });
    } finally {
      setEnrolling(false);
    }
  };

  const toggleWeek = (weekPrefix) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekPrefix]: !prev[weekPrefix]
    }));
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

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
        <TopNav />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Không tìm thấy khóa học!</p>
        </div>
      </div>
    );
  }

  // Group sessions by week
  const weeksMap = {};
  course.sessions.forEach(session => {
    const weekKey = session.week_number ? `Tuần ${session.week_number}` : "Các bài học khác";
    if (!weeksMap[weekKey]) weeksMap[weekKey] = [];
    weeksMap[weekKey].push(session);
  });

  const weekKeys = Object.keys(weeksMap).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <TopNav />
      
      {/* Hero Section */}
      <div className="course-detail-hero" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '3rem 0' }}>
        <div className="container" style={{ padding: '0 20px', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <div className="course-detail-img-wrapper" style={{ flex: '1 1 300px', maxWidth: '400px' }}>
             <img 
                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800'} 
                alt={course.title}
                style={{ width: '100%', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
              />
          </div>
          <div className="course-detail-content" style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <button onClick={() => navigate('/courses')} className="btn btn-outline" style={{ alignSelf: 'flex-start', marginBottom: '1rem', border: 'none', padding: '0' }}>
              <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Quay lại danh sách
            </button>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{course.title}</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>{course.description}</p>
            
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Thời lượng</div>
                  <div style={{ fontWeight: 600 }}>{course.total_days} Ngày</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-warning)' }}>
                  <Target size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kỹ năng</div>
                  <div style={{ fontWeight: 600 }}>{course.focus_skill || "Toàn diện"}</div>
                </div>
              </div>
            </div>

            {course.is_enrolled ? (
              <button 
                className="btn btn-primary" 
                style={{ width: 'fit-content', padding: '0.75rem 2rem', fontSize: '1.1rem', background: 'var(--accent-success)' }}
                onClick={() => navigate('/')}
              >
                <CheckCircle size={20} style={{ marginRight: '0.5rem' }} /> Đang học lộ trình này (Tiếp tục)
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                style={{ width: 'fit-content', padding: '0.75rem 2rem', fontSize: '1.1rem' }}
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? <Loader size={20} className="spin" /> : <><CheckCircle size={20} style={{ marginRight: '0.5rem' }} /> Đăng ký lộ trình này</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="container" style={{ padding: '3rem 20px', flex: 1 }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', textAlign: 'center' }}>Lộ Trình Chi Tiết ({weekKeys.length} Tuần)</h2>
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {weekKeys.map((week, index) => {
            const isExpanded = expandedWeeks[week] || (index === 0 && expandedWeeks[week] === undefined);
            const sessions = weeksMap[week];
            
            return (
              <div key={week} className="glass-panel" style={{ marginBottom: '1rem', overflow: 'hidden' }}>
                <div 
                  onClick={() => toggleWeek(week)}
                  style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? 'rgba(2, 132, 199, 0.05)' : 'transparent', borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none' }}
                >
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{week} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '0.5rem', fontWeight: 'normal' }}>({sessions.length} Buổi)</span></h3>
                  {isExpanded ? <ChevronUp size={20} color="var(--text-secondary)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
                </div>
                
                {isExpanded && (
                  <div style={{ padding: '0.5rem 1.5rem 1.5rem' }}>
                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((dayName, dIdx) => {
                      const session = sessions.find(s => (s.day_number - 1) % 7 === dIdx);
                      return (
                        <div key={dIdx} style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem 0', borderBottom: dIdx === 6 ? 'none' : '1px dashed var(--border-light)' }}>
                          <div style={{ width: '70px', height: '70px', borderRadius: '12px', background: session ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: session ? 'var(--accent-primary)' : 'var(--text-secondary)', flexShrink: 0, border: session ? '1px solid rgba(2, 132, 199, 0.2)' : '1px dashed var(--border-color)', boxShadow: session ? 'var(--shadow-sm)' : 'none' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>{dayName}</span>
                            {session && <span style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.2rem' }}>Day {session.day_number}</span>}
                          </div>
                          
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {session ? (
                              <>
                                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', color: 'var(--text-primary)' }}>{session.title.replace(week + ' - ', '')}</h4>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                  <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(2, 132, 199, 0.1)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                    {session.focus_skill || "Thực hành"}
                                  </span>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={14} /> {session.duration_minutes} Phút
                                  </span>
                                </div>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                                  {session.activity_description}
                                </p>
                              </>
                            ) : (
                              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', height: '100%', fontSize: '0.95rem' }}>
                                ☕ Hôm nay bạn có thể nghỉ ngơi hoặc tự ôn tập nhé!
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Footer />

      {/* Modal */}
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
    </div>
  );
};

export default CourseDetail;
