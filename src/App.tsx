
import { useState } from 'react';
import { Login } from './components/Login';
import { HomePage } from './components/HomePage';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { IncidentEntry } from './components/IncidentEntry';
import { TehsilReport, MonitoringReport } from './components/Reports';
import { DistrictDamageChart } from './components/DistrictDamageChart';
import { Profile } from './components/Profile';
import { ChangePassword } from './components/ChangePassword';
import { UserManagement } from './components/UserManagement';
import { IncidentCategories } from './components/IncidentCategories';
import { UserRole } from './types';
import type { User, Incident } from './types';
import { incidents as initialIncidents} from './services/data';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [page, setPage] = useState('dashboard');
  const [currentYear, setCurrentYear] = useState(2024);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  
  // Initialize Sidebar state: Open on Desktop (>768px), Closed on Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);

  // Simple handler to add new incidents
  const handleSaveIncident = (newIncident: Incident) => {
    setIncidents([...incidents, newIncident]);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setPage('dashboard');
    setShowLogin(false); // Reset login view state
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
    setShowLogin(false); // Go back to Home Page on logout
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Note: In a real application, you would also make an API call to update the backend database here.
  };

  // Logic: 
  // 1. If no user and showLogin is false -> Show HomePage
  // 2. If no user and showLogin is true -> Show Login Component
  // 3. If user exists -> Show Main App (Header + Sidebar + Content)

  if (!user) {
    if (!showLogin) {
      return <HomePage onLoginClick={() => setShowLogin(true)} />;
    }
    return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />;
  }

  return (
    <div className="flex flex-col h-screen font-[Inter] bg-gray-50">
      <Header />
      
      {/* Sub-header with User Info and Sidebar Toggle */}
      <div className="bg-blue-800 text-white px-4 py-2 flex justify-between items-center shadow-inner">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-blue-700 rounded focus:outline-none"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
          <span className="font-medium text-sm md:text-base">
            Welcome: <span className="font-bold text-yellow-300">{user.Display_Name}</span> ({user.Designation})
          </span>
        </div>
        <div className="text-sm opacity-80">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          user={user} 
          currentPage={page} 
          setPage={setPage} 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen}
        />
        
        {/* Overlay for Mobile when Sidebar is Open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        
        <main className="flex-1 overflow-auto p-4 md:p-6 transition-all duration-300">
          {page === 'dashboard' && (
            <Dashboard 
              user={user} 
              incidents={incidents} 
              year={currentYear} 
              setYear={setCurrentYear} 
            />
          )}
          
          {page === 'incident-entry' && user.Roll_id === UserRole.District && (
            <IncidentEntry user={user} onSave={handleSaveIncident} />
          )}

          {page === 'tehsil-report' && user.Roll_id === UserRole.District && (
            <TehsilReport user={user} incidents={incidents} year={currentYear} onYearChange={setCurrentYear} />
          )}

          {page === 'monitoring-report' && (user.Roll_id === UserRole.State || user.Roll_id === UserRole.Admin) && (
            <MonitoringReport incidents={incidents} year={currentYear} onYearChange={setCurrentYear} />
          )}

          {page === 'district-damage-chart' && (user.Roll_id === UserRole.State || user.Roll_id === UserRole.Admin) && (
            <DistrictDamageChart incidents={incidents} year={currentYear} onYearChange={setCurrentYear} />
          )}

          {page === 'incident-categories' && (user.Roll_id === UserRole.State || user.Roll_id === UserRole.Admin) && (
            <IncidentCategories />
          )}

          {page === 'user-management' && (
             <UserManagement />
          )}

          {page === 'profile' && (
            <Profile user={user} onUpdate={handleUpdateUser} />
          )}

          {page === 'change-password' && (
            <ChangePassword user={user} />
          )}
        </main>
      </div>
    </div>
  );
}
