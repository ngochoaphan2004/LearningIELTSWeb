import React, { useState, useEffect } from 'react';
import { Book, Edit3, Headphones, AlertTriangle, Loader, Calendar, LayoutGrid, List, Search, Filter, Table, ArrowDownAZ, Clock } from 'lucide-react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import apiClient from '../config/axios';

const Notebooks = () => {
  const [activeTab, setActiveTab] = useState('vocabulary');
  const [viewMode, setViewMode] = useState('table'); // 'grid' hoặc 'list'
  const [data, setData] = useState({ vocabulary: [], errors: [], dictation: [] });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'alphabet'

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1000);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchNotebooks();
  }, [debouncedSearch, startDate, endDate, sortBy]);

  const fetchNotebooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (sortBy) params.append('sortBy', sortBy);

      const qs = params.toString() ? `?${params.toString()}` : '';

      const [vocabRes, errorRes, dictationRes] = await Promise.all([
        apiClient.get(`/api/notebooks/vocabulary${qs}`),
        apiClient.get(`/api/notebooks/errors${qs}`),
        apiClient.get(`/api/notebooks/dictation${qs}`)
      ]);
      setData({
        vocabulary: vocabRes.data.data || [],
        errors: errorRes.data.data || [],
        dictation: dictationRes.data.data || []
      });
    } catch (error) {
      console.error("Lỗi khi tải sổ tay:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderVocabularyItem = (item) => (
    <div key={item.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', borderTop: viewMode === 'grid' ? '6px solid var(--accent-primary)' : 'none', borderLeft: viewMode === 'list' ? '4px solid var(--accent-primary)' : 'none', display: viewMode === 'list' ? 'flex' : 'block', flexDirection: viewMode === 'list' ? 'column' : 'unset', gap: '0.5rem', background: 'var(--bg-primary)', boxShadow: viewMode === 'grid' ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}>
      {viewMode === 'list' ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-primary)', margin: 0, fontWeight: 700 }}>{item.phrase}</h3>
          <p style={{ fontWeight: 600, margin: 0, textAlign: 'right', color: 'var(--text-primary)' }}>{item.meaning}</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 800 }}>{item.phrase}</h3>
          <p style={{ fontWeight: 600, color: 'var(--accent-primary)', background: 'rgba(2, 132, 199, 0.1)', display: 'inline-block', padding: '0.25rem 1rem', borderRadius: '2rem' }}>{item.meaning}</p>
        </div>
      )}

      {item.example_sentence && (
        <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '0.5rem', fontStyle: 'italic' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Ví dụ:</strong> {item.example_sentence}
        </div>
      )}
      {item.errors_in_sentence && (
        <div style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', color: '#b91c1c' }}>
          <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px' }}/> {item.errors_in_sentence}
        </div>
      )}
      <div style={{ marginTop: viewMode === 'grid' ? '1.5rem' : '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: viewMode === 'grid' ? 'center' : 'flex-start', borderTop: viewMode === 'grid' ? '1px solid var(--border-light)' : 'none', paddingTop: viewMode === 'grid' ? '0.75rem' : '0' }}>
        <Calendar size={12}/> {new Date(item.created_at).toLocaleDateString('vi-VN')}
      </div>
    </div>
  );

  const renderVocabularyTable = () => (
    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cụm từ</th>
            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Nghĩa</th>
            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ví dụ & Lỗi</th>
            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ngày học</th>
          </tr>
        </thead>
        <tbody>
          {data.vocabulary.map((item, idx) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 0 ? 'white' : 'var(--bg-secondary)' }}>
              <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{item.phrase}</td>
              <td style={{ padding: '1rem', fontWeight: 600 }}>{item.meaning}</td>
              <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                {item.example_sentence && <div style={{ fontStyle: 'italic', marginBottom: '0.25rem' }}>"{item.example_sentence}"</div>}
                {item.errors_in_sentence && <div style={{ color: '#b91c1c' }}><AlertTriangle size={12} style={{ display: 'inline' }}/> {item.errors_in_sentence}</div>}
              </td>
              <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(item.created_at).toLocaleDateString('vi-VN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderVocabulary = () => {
    if (data.vocabulary.length === 0) return <p className="text-secondary text-center py-4">Chưa có từ vựng nào được lưu.</p>;
    
    // Gom nhóm theo chữ cái nếu sortBy là alphabet
    const groupedData = {};
    if (sortBy === 'alphabet') {
      data.vocabulary.forEach(item => {
        const letter = (item.phrase || '').charAt(0).toUpperCase();
        const group = /[A-Z]/.test(letter) ? letter : '#';
        if (!groupedData[group]) groupedData[group] = [];
        groupedData[group].push(item);
      });
    }

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0.25rem', display: 'flex', gap: '0.25rem' }}>
            <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem', background: viewMode === 'list' ? 'white' : 'transparent', border: 'none', borderRadius: '6px', color: viewMode === 'list' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none' }} title="Danh sách">
              <List size={18} />
            </button>
            <button onClick={() => setViewMode('grid')} style={{ padding: '0.5rem', background: viewMode === 'grid' ? 'white' : 'transparent', border: 'none', borderRadius: '6px', color: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none' }} title="Dạng Flashcard">
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setViewMode('table')} style={{ padding: '0.5rem', background: viewMode === 'table' ? 'white' : 'transparent', border: 'none', borderRadius: '6px', color: viewMode === 'table' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none' }} title="Dạng bảng">
              <Table size={18} />
            </button>
          </div>
        </div>
        
        {viewMode === 'table' ? renderVocabularyTable() : (
          sortBy === 'alphabet' ? (
            Object.keys(groupedData).sort().map(letter => (
              <div key={letter} style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', borderBottom: '3px solid var(--accent-primary)', display: 'inline-block', marginBottom: '1rem', paddingRight: '1rem' }}>{letter}</h2>
                <div className="animate-fade-in" style={{ gap: '1rem', display: viewMode === 'grid' ? 'grid' : 'flex', flexDirection: viewMode === 'list' ? 'column' : 'row', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none' }}>
                  {groupedData[letter].map(item => renderVocabularyItem(item))}
                </div>
              </div>
            ))
          ) : (
            <div className="animate-fade-in" style={{ gap: '1rem', display: viewMode === 'grid' ? 'grid' : 'flex', flexDirection: viewMode === 'list' ? 'column' : 'row', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none' }}>
              {data.vocabulary.map(item => renderVocabularyItem(item))}
            </div>
          )
        )}
      </div>
    );
  };

  const renderErrors = () => {
    if (data.errors.length === 0) return <p className="text-secondary text-center py-4">Chưa có bảng lỗi Writing nào được lưu.</p>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.errors.map(item => (
          <div key={item.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Bài viết đoạn văn (Writing)</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontStyle: 'italic', fontSize: '0.95rem' }}>
              {item.content_submitted}
            </div>
            {item.errors_found && (
              <div style={{ borderLeft: '3px solid var(--accent-danger)', paddingLeft: '1rem' }}>
                <h4 style={{ color: 'var(--accent-danger)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={16}/> Sửa lỗi:</h4>
                <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{item.errors_found}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDictation = () => {
    if (data.dictation.length === 0) return <p className="text-secondary text-center py-4">Chưa có bài chép chính tả nào được lưu.</p>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.dictation.map(item => (
          <div key={item.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', borderTop: '4px solid var(--accent-warning)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Chép chính tả</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            
            {item.audio_link && (
              <a href={item.audio_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <Headphones size={16}/> Nghe lại Audio
              </a>
            )}

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', fontSize: '0.95rem', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {item.dictation_text}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <TopNav />
      
      {/* Hero Section */}
      <section className="hero-section" style={{ padding: '3rem 0 2rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Sổ tay Học tập</h1>
          <p className="hero-description" style={{ maxWidth: '600px', margin: '0 auto' }}>Lưu trữ toàn bộ kiến thức, từ vựng và những lỗi sai để bạn có thể dễ dàng tra cứu và ôn tập lại bất cứ lúc nào.</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container" style={{ flex: 1, paddingBottom: '4rem' }}>
        
        {/* Toolbar: Tabs & Filter */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('vocabulary')}
              className={`btn ${activeTab === 'vocabulary' ? 'btn-primary' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Book size={18}/> Sổ Từ vựng
            </button>
            <button 
              onClick={() => setActiveTab('errors')}
              className={`btn ${activeTab === 'errors' ? 'btn-primary' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Edit3 size={18}/> Bảng lỗi Writing
            </button>
            <button 
              onClick={() => setActiveTab('dictation')}
              className={`btn ${activeTab === 'dictation' ? 'btn-primary' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Headphones size={18}/> Sổ Chính tả
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ flex: '1 1 300px', maxWidth: '500px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Tìm kiếm từ vựng, bài viết, ngày đã học..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <Filter size={16} color="var(--text-secondary)" style={{ marginLeft: '0.5rem' }}/>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ border: 'none', outline: 'none', padding: '0.5rem', color: 'var(--text-secondary)' }}
              />
              <span style={{ color: 'var(--border-color)' }}>-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ border: 'none', outline: 'none', padding: '0.5rem', color: 'var(--text-secondary)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                style={{ border: 'none', outline: 'none', padding: '0.5rem', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="alphabet">A-Z (Alphabet)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ minHeight: '300px' }}>
          {loading ? (
            <div className="flex-center" style={{ padding: '3rem 0' }}>
              <Loader className="spin" size={32} color="var(--accent-primary)" />
            </div>
          ) : (
            <>
              {activeTab === 'vocabulary' && renderVocabulary()}
              {activeTab === 'errors' && renderErrors()}
              {activeTab === 'dictation' && renderDictation()}
            </>
          )}
        </div>

      </div>
      
      <Footer />
    </div>
  );
};

export default Notebooks;
