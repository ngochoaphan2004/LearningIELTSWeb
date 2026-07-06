import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Flame, BookOpen, AlertCircle, Play, ChevronRight, ChevronLeft, X, Menu, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import apiClient from '../config/axios';

const DashboardHero = ({ onStart }) => (
  <section className="hero-section">
    <div className="container">
      <p className="hero-subtitle">Chào mừng trở lại, Chiến binh IELTS!</p>
      
      <h1 className="hero-title">
        CHINH PHỤC MỤC TIÊU <span className="text-gradient">8.0+</span> CÙNG <span style={{ color: 'var(--accent-primary)' }}>IELTS SOCIAL</span>
      </h1>
      
      <p className="hero-description">
        Tối ưu hóa thời gian học tập, theo dõi tiến độ mỗi ngày và kết nối với hàng ngàn học viên khác. Hãy biến áp lực thành động lực và chinh phục band điểm mơ ước của bạn.
      </p>
      
      <button className="btn btn-primary hero-btn" onClick={onStart}>
        <Play size={20} className="btn-icon" />
        Bắt đầu bài học hôm nay
      </button>
    </div>
  </section>
);

const formatSessionTitle = (title) => {
  if (!title) return title;
  const t = title.toLowerCase();
  if (t.includes('thứ 2')) return 'Buổi thứ 1';
  if (t.includes('thứ 3')) return 'Buổi thứ 2';
  if (t.includes('thứ 4')) return 'Buổi thứ 3';
  if (t.includes('thứ 5')) return 'Buổi thứ 4';
  if (t.includes('thứ 6')) return 'Buổi thứ 5';
  if (t.includes('thứ 7')) return 'Buổi thứ 6';
  if (t.includes('chủ nhật')) return 'Buổi thứ 7';
  return title;
};

const MonthlyCalendar = ({ studyActivities = [], missedSessions = [] }) => {
  const [viewingMonth, setViewingMonth] = useState(new Date());

  const handlePrevMonth = () => {
    const minDate = new Date();
    minDate.setMonth(minDate.getMonth() - 24);
    const newMonth = new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() - 1, 1);
    if (newMonth >= minDate) setViewingMonth(newMonth);
  };

  const handleNextMonth = () => {
    const today = new Date();
    const newMonth = new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() + 1, 1);
    if (newMonth <= new Date(today.getFullYear(), today.getMonth(), 1)) setViewingMonth(newMonth);
  };

  const year = viewingMonth.getFullYear();
  const month = viewingMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const days = [];
  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  
  dayNames.forEach(d => {
    days.push(<div key={`h-${d}`} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{d}</div>);
  });
  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`empty-${i}`} />);
  }
  
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  
  // Dùng ngày created_at của FeedActivity để xác định ngày có học
  const completedDates = studyActivities.map(s => new Date(s.created_at).toDateString());
  const missedDates = missedSessions.map(s => new Date(s.scheduled_date || new Date()).toDateString());

  for (let i = 1; i <= daysInMonth; i++) {
    let statusClass = '';
    const currentCellDate = new Date(year, month, i).toDateString();

    if (isCurrentMonth && today.getDate() === i) {
      statusClass += ' today';
    }
    if (completedDates.includes(currentCellDate)) {
      statusClass += ' completed';
    } else if (missedDates.includes(currentCellDate)) {
      statusClass += ' missed';
    }

    days.push(<div key={`day-${i}`} className={`cal-day ${statusClass}`}>{i}</div>);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}><CalendarIcon size={18}/> Tháng {month + 1}, {year}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <button className="btn btn-outline" onClick={handlePrevMonth} style={{ padding: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}><ChevronLeft size={16} /></button>
           <button className="btn btn-outline" onClick={handleNextMonth} style={{ padding: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="calendar-grid">{days}</div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, leadRes] = await Promise.all([
          apiClient.get('/api/users/me/dashboard'),
          apiClient.get('/api/users/leaderboard')
        ]);
        setDashboardData(dashRes.data);
        setLeaderboard(leadRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartSession = () => {
    if (dashboardData?.next_session) {
      navigate(`/session/${dashboardData.next_session.id}`);
    }
  };

  // Modal to view other users' Dashboard
  const UserModal = () => {
    if (!selectedUser) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
        <div className="glass-panel animate-fade-in" style={{ width: '450px', padding: '2rem', position: 'relative' }}>
          <button onClick={() => setSelectedUser(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X /></button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="avatar" style={{ width: '60px', height: '60px', fontSize: '1.5rem', background: 'var(--accent-secondary)', color: 'white' }}>{selectedUser.avatar}</div>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selectedUser.user}</h2>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}><Flame size={14}/> Hiện tại: {selectedUser.streak}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Flame size={14} color="#9ca3af"/> Kỷ lục: {selectedUser.maxStreak}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tổng số buổi học đã tham gia</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{selectedUser.totalSessions} buổi</p>
          </div>
          
          <MonthlyCalendar user={selectedUser} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <Loader className="spin" size={40} color="var(--accent-primary)" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <TopNav />
      <DashboardHero onStart={handleStartSession} />

      <div className="container dashboard-layout" style={{ paddingBottom: '4rem', flex: 1 }}>
        
        {/* LEFT COLUMN: Personal Dashboard */}
        <div className="space-y-4 animate-fade-in">
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="glass-panel streak-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--accent-warning)', marginBottom: '0.25rem', fontSize: '1rem' }}>Chuỗi ngày học</h3>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{dashboardData?.streak || 0} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>ngày</span></p>
              </div>
              <Flame size={40} className="icon" style={{ color: 'var(--accent-warning)' }} />
            </div>

            <div className="glass-panel streak-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.25rem', fontSize: '1rem' }}>Bài đã học</h3>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{dashboardData?.total_completed || 0} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>bài</span></p>
              </div>
              <BookOpen size={40} className="icon" style={{ color: 'var(--accent-primary)' }} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <MonthlyCalendar 
              studyActivities={dashboardData?.study_activities || []} 
              missedSessions={dashboardData?.missed_sessions || []} 
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-success)' }}></div> Đã hoàn thành</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-danger)' }}></div> Bỏ lỡ</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', border: '1px solid var(--accent-primary)' }}></div> Hôm nay</span>
            </div>
          </div>



          <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.05), rgba(14, 165, 233, 0.1))', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
            {dashboardData?.next_session ? (
              <>
                <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'var(--accent-primary)', color: 'white', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
                  BÀI HỌC TIẾP THEO (DAY {dashboardData.next_session.day_number})
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Tuần {dashboardData.next_session.week_number} - {formatSessionTitle(dashboardData.next_session.title)}</h2>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{dashboardData.next_session.focus_skill}</h3>
                <p style={{ marginBottom: '1.5rem' }}>{dashboardData.next_session.activity_description}</p>
                <button onClick={handleStartSession} className="btn btn-primary" style={{ width: '100%' }}>
                  <Play size={18}/> Bắt đầu buổi học ({dashboardData.next_session.duration_minutes} Phút)
                </button>
              </>
            ) : !dashboardData?.current_course ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bắt đầu hành trình</h2>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Bạn chưa đăng ký khóa học nào. Hãy khám phá và chọn một lộ trình phù hợp nhé!</p>
                <button onClick={() => navigate('/courses')} className="btn btn-primary" style={{ width: 'fit-content', margin: '0 auto' }}>
                  Khám phá khóa học
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Chúc mừng!</h2>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Bạn đã hoàn thành toàn bộ lộ trình khóa học hiện tại.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Leaderboard */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="glass-panel" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', background: 'linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Flame size={20} color="var(--accent-warning)" /> Bảng xếp hạng</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              {leaderboard.map((player, index) => {
                const isMe = dashboardData?.user_info?.id === player.id;
                return (
                <div 
                  key={player.id} 
                  className="feed-item" 
                  onClick={() => setSelectedUser(player)}
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', borderRadius: '8px', margin: '0.5rem', background: isMe ? 'var(--bg-primary)' : 'transparent', border: isMe ? '1px solid var(--accent-primary)' : '1px solid transparent', cursor: 'pointer' }}
                >
                  <div style={{ width: '30px', fontWeight: 700, color: index < 3 ? 'var(--accent-warning)' : 'var(--text-secondary)', fontSize: index < 3 ? '1.2rem' : '1rem' }}>
                    #{index + 1}
                  </div>
                  <div className="avatar" style={{ width: '40px', height: '40px', background: isMe ? 'var(--accent-primary)' : 'rgba(2, 132, 199, 0.1)', color: isMe ? 'white' : 'var(--accent-primary)' }}>
                    {player.avatar}
                  </div>
                  <div style={{ flex: 1, marginLeft: '0.75rem' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: isMe ? 700 : 500, color: 'var(--text-primary)', margin: 0 }}>
                      {player.user} {isMe && '(Bạn)'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Tổng: {player.totalSessions} bài</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-warning)', fontWeight: 700 }}>
                      <Flame size={16}/> {player.streak}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>

      </div>
      
      <UserModal />
      <Footer />
    </div>
  );
};

export default Dashboard;
