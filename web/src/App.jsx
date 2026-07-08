import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import apiClient from './config/axios';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import FocusMode from './pages/FocusMode';
import Courses from './pages/Courses';
import MyCourses from './pages/MyCourses';
import CourseDetail from './pages/CourseDetail';
import Notebooks from './pages/Notebooks';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state (automatically remembers state even on reload)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          await apiClient.post('/api/auth/sync', { idToken });
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Lỗi đồng bộ tài khoản", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // Fast loading screen while Firebase checks Cookie/IndexedDB
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
          path="/courses"
          element={isAuthenticated ? <Courses /> : <Navigate to="/auth" />}
        />
        <Route
          path="/courses/:id"
          element={isAuthenticated ? <CourseDetail /> : <Navigate to="/auth" />}
        />
        <Route
          path="/my-courses"
          element={isAuthenticated ? <MyCourses /> : <Navigate to="/auth" />}
        />
        <Route
          path="/notebooks"
          element={isAuthenticated ? <Notebooks /> : <Navigate to="/auth" />}
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
