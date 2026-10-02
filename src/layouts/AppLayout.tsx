import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Map,
  CheckCircle2,
  FolderGit2,
  FileText,
  FileCheck2,
  Mic,
  Bot,
  LineChart,
  Settings,
  Menu,
  X,
  LogOut,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FloatingAICoach } from '../components/FloatingAICoach';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, roleFit, logout, toast } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/career', label: 'My Career & Skills', icon: Compass },
    { to: '/skill-gap', label: 'Skill Gap', icon: AlertCircle },
    { to: '/roadmap', label: 'Learning Path', icon: Map },
    { to: '/assessments', label: 'Assessments', icon: CheckCircle2 },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/resume', label: 'Resume Analyzer', icon: FileText },
    { to: '/job-match', label: 'Resume Job Match', icon: FileCheck2 },
    { to: '/interview', label: 'Interview Simulator', icon: Mic },
    { to: '/ai-coach', label: 'AI Mentor', icon: Bot, highlight: true },
    { to: '/analytics', label: 'Analytics', icon: LineChart },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const currentNavItem = navItems.find((n) => n.to === location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-900 font-sans">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Dark Navy Aesthetic) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-900 shrink-0 select-none">
        {/* Brand Lockup */}
        <div className="h-16 px-6 flex items-center border-b border-slate-900">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-tight">
              CA
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-none">
                CareerAI
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Intelligence Platform
              </span>
            </div>
          </div>
        </div>

        {/* Quick Role Fit Metric Mini-Card */}
        {roleFit && (
          <div className="mx-4 my-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Career Readiness</span>
              <span className="font-mono tabular-nums text-indigo-400 font-semibold">
                {roleFit.fitScore}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${roleFit.fitScore}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
              <span className="truncate max-w-[130px] font-medium">{roleFit.roleTitle}</span>
              <span className="text-[10px] text-slate-400">{roleFit.readinessLevel}</span>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all group whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : item.highlight
                    ? 'text-indigo-300 hover:bg-slate-900 hover:text-white bg-indigo-950/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Mini Profile & Signout */}
        <div className="p-3 border-t border-slate-900">
          <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-slate-900/60 border border-slate-800">
            <img
              src={user?.avatar || '/src/assets/images/avatar_student_1790957486261.jpg'}
              alt={user?.name || 'User'}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover bg-slate-800 border border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                {user?.name || 'Student'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 px-4 md:px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>CareerAI</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold">
                {currentNavItem?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            {/* AI Coach Quick Trigger */}
            <button
              onClick={() => navigate('/ai-coach')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask AI Coach</span>
            </button>

            {/* Role Fit Badge */}
            {roleFit && (
              <div
                onClick={() => navigate('/career')}
                className="cursor-pointer hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs hover:border-slate-300 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-600">Role Fit:</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {roleFit.fitScore}%
                </span>
              </div>
            )}

            {/* User Profile Avatar Link */}
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 hover:opacity-85 transition-opacity"
            >
              <img
                src={user?.avatar || '/src/assets/images/avatar_student_1790957486261.jpg'}
                alt={user?.name || 'User Profile'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            </button>
          </div>
        </header>

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs flex"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 bg-slate-950 h-full p-4 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      CA
                    </div>
                    <span className="font-bold text-white text-sm">CareerAI</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-rose-400 bg-rose-950/30 rounded border border-rose-900"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Mobile Sticky Bottom Nav Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 flex items-center justify-around z-30 px-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/career"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500'
              }`
            }
          >
            <Compass className="w-4 h-4" />
            <span>Career</span>
          </NavLink>
          <NavLink
            to="/roadmap"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500'
              }`
            }
          >
            <Map className="w-4 h-4" />
            <span>Roadmap</span>
          </NavLink>
          <NavLink
            to="/ai-coach"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500'
              }`
            }
          >
            <Bot className="w-4 h-4" />
            <span>AI Coach</span>
          </NavLink>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-slate-500"
          >
            <Menu className="w-4 h-4" />
            <span>More</span>
          </button>
        </div>

        {/* Floating AI Coach Widget */}
        <FloatingAICoach />
      </div>
    </div>
  );
};
