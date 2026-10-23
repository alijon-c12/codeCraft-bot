import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { GlobalModals } from './components/Modals.jsx';
import {
  HomePage,
  CoursesCatalogPage,
  CourseDetailPage,
  TeachersPage,
  TeacherProfilePage,
  StaticContentPage
} from './pages/PublicPages.jsx';
import { AuthPage } from './pages/AuthPages.jsx';
import { StudentDashboardPage, LearningPage, MyCoursesPage } from './pages/StudentAndLearningPages.jsx';
import { TeacherPanelPage, AdminPanelPage } from './pages/TeacherAndAdminPages.jsx';

function AppRouter() {
  const { route, toast, currentUser } = useApp();

  function renderPage() {
    switch (route.page) {
      case 'home':
        return currentUser ? <CoursesCatalogPage /> : <HomePage />;
      case 'courses':
        return currentUser ? <CoursesCatalogPage /> : <AuthPage mode="login" />;
      case 'myCourses':
        return currentUser ? <MyCoursesPage /> : <AuthPage mode="login" />;
      case 'courseDetail':
        return currentUser ? <CourseDetailPage /> : <AuthPage mode="login" />;
      case 'teachers':
        return currentUser ? <CoursesCatalogPage /> : <TeachersPage />;
      case 'teacherProfile':
        return currentUser ? <CoursesCatalogPage /> : <TeacherProfilePage />;
      case 'verifyCert':
        return currentUser ? <CoursesCatalogPage /> : <HomePage />;
      case 'about':
        return currentUser ? <CoursesCatalogPage /> : <StaticContentPage slug="about" />;
      case 'contact':
        return currentUser ? <CoursesCatalogPage /> : <StaticContentPage slug="contact" />;
      case 'privacy':
        return <StaticContentPage slug="privacy" />;
      case 'terms':
        return <StaticContentPage slug="terms" />;
      case 'login':
      case 'register':
        return currentUser ? <CoursesCatalogPage /> : <AuthPage mode="login" />;
      case 'dashboard':
        return <StudentDashboardPage />;
      case 'learning':
        return <LearningPage />;
      case 'teacher':
        return <TeacherPanelPage />;
      case 'admin':
      case 'studentsPanel':
        return <AdminPanelPage />;
      default:
        return currentUser ? <CoursesCatalogPage /> : <HomePage />;
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-view">{renderPage()}</main>
      <GlobalModals />
      {toast && (
        <div className={`toast-notification ${toast.type}`} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}

const App = () => {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
};

export default App;