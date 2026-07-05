import React, { useState } from 'react';
import { Calendar as CalendarIcon, Flame, BookOpen, AlertCircle, Play, ChevronRight, ChevronLeft, X, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

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

const MonthlyCalendar = ({ user }) => {
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
  
  const seed = user && user.id ? user.id : 0;
  
  for (let i = 1; i <= daysInMonth; i++) {
    let statusClass = '';
    if (isCurrentMonth) {
      if (i < 14) statusClass = 'completed';
      if (i === 14) statusClass = 'missed';
      if (i === 15 && (!user || user.isMe)) statusClass = 'today';
    } else {
      if ((i + seed) % 5 === 0) statusClass = 'missed';
      else statusClass = 'completed';
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

  // Mock Data
  const myStreak = 12;
  const leaderboard = [
    { id: 1, user: 'Hoàng Nam', avatar: 'N', streak: 45, maxStreak: 50, totalSessions: 120, isMe: false },
    { id: 2, user: 'Trần Hoa', avatar: 'H', streak: 30, maxStreak: 35, totalSessions: 85, isMe: false },
    { id: 3, user: 'Bạn', avatar: 'M', streak: 12, maxStreak: 15, totalSessions: 40, isMe: true },
    { id: 4, user: 'Lê Minh', avatar: 'L', streak: 5, maxStreak: 20, totalSessions: 60, isMe: false },
  ].sort((a, b) => b.streak - a.streak);

  const handleStartSession = () => {
    navigate('/session/15');
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

  return (
    <>
      <TopNav />
      <DashboardHero onStart={handleStartSession} />

      <div className="container dashboard-layout">
        
        {/* LEFT COLUMN: Personal Dashboard */}
        <div className="space-y-4 animate-fade-in">
          
          <div className="glass-panel streak-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: 'var(--accent-warning)', marginBottom: '0.25rem' }}>Chuỗi ngày học liên tục</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{myStreak} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>ngày</span></p>
            </div>
            <Flame size={48} className="icon" />
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <MonthlyCalendar user={{ id: 'me', isMe: true }} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-success)' }}></div> Đã hoàn thành</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-danger)' }}></div> Bỏ lỡ</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', border: '1px solid var(--accent-primary)' }}></div> Hôm nay</span>
            </div>
          </div>



          <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.05), rgba(14, 165, 233, 0.1))', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
            <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'var(--accent-primary)', color: 'white', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>BÀI HỌC TIẾP THEO (DAY 14)</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Reading Part 2: True/False/Not Given</h2>
            <p style={{ marginBottom: '1.5rem' }}>Phân tích xu hướng và cách gộp nhóm dữ liệu hiệu quả.</p>
            <button onClick={handleStartSession} className="btn btn-primary" style={{ width: '100%' }}>
              <Play size={18}/> Bắt đầu buổi học (60 Phút)
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Leaderboard */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="glass-panel" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', background: 'linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Flame size={20} color="var(--accent-warning)" /> Bảng xếp hạng</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              {leaderboard.map((player, index) => (
                <div 
                  key={player.id} 
                  className="feed-item" 
                  onClick={() => setSelectedUser(player)}
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', borderRadius: '8px', margin: '0.5rem', background: player.isMe ? 'var(--bg-primary)' : 'transparent', border: player.isMe ? '1px solid var(--accent-primary)' : '1px solid transparent', cursor: 'pointer' }}
                >
                  <div style={{ width: '30px', fontWeight: 700, color: index < 3 ? 'var(--accent-warning)' : 'var(--text-secondary)', fontSize: index < 3 ? '1.2rem' : '1rem' }}>
                    #{index + 1}
                  </div>
                  <div className="avatar" style={{ width: '40px', height: '40px', background: player.isMe ? 'var(--accent-primary)' : 'rgba(2, 132, 199, 0.1)', color: player.isMe ? 'white' : 'var(--accent-primary)' }}>
                    {player.avatar}
                  </div>
                  <div style={{ flex: 1, marginLeft: '0.75rem' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: player.isMe ? 700 : 500, color: 'var(--text-primary)', margin: 0 }}>
                      {player.user} {player.isMe && '(Bạn)'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Tổng: {player.totalSessions} ngày</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-warning)', fontWeight: 700 }}>
                      <Flame size={16}/> {player.streak}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      
      <UserModal />
    </>
  );
};

export default Dashboard;
