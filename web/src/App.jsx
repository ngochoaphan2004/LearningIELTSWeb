import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import FocusMode from './pages/FocusMode';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lắng nghe trạng thái đăng nhập từ Firebase (tự động nhớ trạng thái kể cả khi F5)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    // Hủy lắng nghe khi component unmount
    return () => unsubscribe();
  }, []);

  // Màn hình chờ siêu tốc trong lúc Firebase kiểm tra Cookie/IndexedDB
  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', color: 'var(--text-secondary)' }}>
        Đang tải dữ liệu người dùng...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Nếu đã đăng nhập mà vẫn cố vào /auth thì đẩy về trang chủ */}
        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to="/" /> : <Auth />}
        />

        {/* Protected Routes (Cần đăng nhập mới cho vào) */}
        <Route
          path="/"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />}
        />
        <Route
          path="/session/:id"
          element={isAuthenticated ? <FocusMode /> : <Navigate to="/auth" />}
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
