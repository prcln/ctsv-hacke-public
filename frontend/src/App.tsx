import { useState, useEffect } from 'react';
import './App.css';

import { useToast } from './context/ToastContext';

import type { Category } from './types/criteria.types';
import type { Activity } from './types/activity.types';
import ActivityList from './components/ActivityList';
import DrlDashboardView from './components/DrlDashboardView';
import Sidebar from './components/Sidebar';

function App() {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('ctsv_username') || '';
  });
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const [criteriaList, setCriteriaList] = useState<Category[]>([]);
  const [currentTab, setCurrentTab] = useState<'activities' | 'criteria'>('activities');

  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  const [participatingId, setParticipatingId] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { showToast } = useToast();

  // 1. Core Activity Loader
  async function loadActivities(targetUser: string, refresh = false, incomplete = false) {
    if (!targetUser.trim()) {
      showToast('Vui lòng nhập mã số sinh viên!', 'error');
      return;
    }

    try {
      setIsLoadingActivities(true);
      const params = new URLSearchParams();
      if (refresh) params.set('refresh', 'true');
      if (incomplete) params.set('incomplete_criteria', 'true');

      const url = `/api/users/${targetUser.trim()}/activities?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const resData = await response.json();
      const activities: Activity[] = resData.data || [];
      setActivityList(activities);

      if (refresh) {
        showToast(`Đã đồng bộ ${activities.length} hoạt động mới nhất!`, 'success');
      } else if (incomplete) {
        showToast(`Tìm thấy ${activities.length} hoạt động giúp bù điểm tiêu chí còn thiếu!`, 'success');
      }

      return activities;
    } catch (error) {
      console.error('Failed to load activities:', error);
      showToast('Không thể tải danh sách hoạt động. Vui lòng thử lại!', 'error');
    } finally {
      setIsLoadingActivities(false);
    }
  }

  // 2. Core Criteria Loader
  async function loadCriteria(targetUser: string, silent = false) {
    if (!targetUser.trim()) {
      if (!silent) showToast('Vui lòng nhập mã số sinh viên!', 'error');
      return;
    }

    try {
      setIsLoadingCriteria(true);
      const response = await fetch(`/api/users/${targetUser.trim()}/criteria`);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const categories: Category[] = data.data || [];
      setCriteriaList(categories);

      if (!silent) {
        showToast('Đã tải bảng điểm rèn luyện mới nhất!', 'success');
      }
      return categories;
    } catch (error) {
      console.error('Failed to load criteria:', error);
      if (!silent) {
        showToast('Không thể tải bảng điểm rèn luyện. Vui lòng thử lại!', 'error');
      }
    } finally {
      setIsLoadingCriteria(false);
    }
  }

  // Initial Auto-load for default student ID
  useEffect(() => {
    if (username.trim()) {
      loadActivities(username, false, false);
      loadCriteria(username, true);
    }
  }, []);

  // Event Handlers for Sidebar & Actions
  function handleGetActivities(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    loadActivities(username, false, false);
    loadCriteria(username, true);
  }

  function handleRefreshActivities(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    loadActivities(username, true, false);
    loadCriteria(username, true);
  }

  function handleMissingCriteriaActivities(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    setCurrentTab('activities');
    loadActivities(username, false, true);
  }

  function handleGetCriteria(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    setCurrentTab('criteria');
    loadCriteria(username, false);
  }

  // Participate in Activity + Auto-refresh both activities and criteria
  async function handleParticipate(activityId: number) {
    if (!username.trim()) {
      showToast('Vui lòng nhập mã số sinh viên trước khi đăng ký!', 'error');
      return;
    }

    try {
      setParticipatingId(activityId);

      const payload = {
        username: username.trim(),
        activityId: activityId,
      };

      const response = await fetch(`/api/users/${username.trim()}/activities/${activityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        const respText = data.data?.RespText || data.message || 'Đăng ký thành công!';
        if (data.data?.RespCode === 104 || respText === 'Hoạt động đã được đăng ký trước đây') {
          showToast(respText, 'error');
        } else {
          showToast(respText, 'success');
        }

        // Auto Refresh: Sync updated status in activities and criteria points
        await loadActivities(username, true, false);
        await loadCriteria(username, true);
      } else {
        showToast(data.detail || 'Không thể đăng ký hoạt động', 'error');
      }
    } catch (error) {
      showToast('Lỗi kết nối khi gửi yêu cầu đăng ký', 'error');
    } finally {
      setParticipatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100/70 text-gray-800 flex flex-col lg:flex-row antialiased">
      {/* 1. LEFT SIDEBAR */}
      <Sidebar
        username={username}
        setUsername={(val) => {
          setUsername(val);
          if (val.trim()) {
            localStorage.setItem('ctsv_username', val.trim());
          } else {
            localStorage.removeItem('ctsv_username');
          }
        }}
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab as 'activities' | 'criteria')}
        onGetActivities={handleGetActivities}
        onRefreshActivities={handleRefreshActivities}
        onMissingCriteriaActivities={handleMissingCriteriaActivities}
        onGetCriteria={handleGetCriteria}
        isLoading={isLoadingActivities || isLoadingCriteria}
        activitiesCount={activityList.length}
        criteriaData={criteriaList}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* 2. RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header (Hidden on lg+) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-gray-200/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs">
                H
              </div>
              <span className="font-black text-sm text-gray-900 tracking-tight">
                CTSV HUST
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
              currentTab === 'activities' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
            }`}>
              {currentTab === 'activities' ? 'Sự kiện' : 'Điểm rèn luyện'}
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'activities' && (
            <ActivityList
              activities={activityList}
              criteriaList={criteriaList}
              onParticipate={handleParticipate}
              participatingId={participatingId}
              onRefresh={() => loadActivities(username, false, false)}
            />
          )}

          {currentTab === 'criteria' && (
            <DrlDashboardView
              criteria={criteriaList}
              onNavigateToMissingActivities={() => handleMissingCriteriaActivities()}
              onRefreshCriteria={() => loadCriteria(username, false)}
              isLoading={isLoadingCriteria}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
