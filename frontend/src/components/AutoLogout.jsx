import { useEffect, useRef, useState } from 'react';

const WARNING_TIME = 1 * 60 * 1000; // 14 minutes
const LOGOUT_TIME = 15 * 60 * 1000; // 15 minutes total

const AutoLogout = ({ children }) => {
  const [showWarning, setShowWarning] = useState(false);
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('adminToken')
      if (token) {
        try {
          await fetch(`${import.meta.env.VITE_BASE_URL}/admin/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}),
            keepalive: true,
          })
        } catch (e) { /* ignore */ }
      }
    } finally {
      sessionStorage.removeItem('adminToken');
      window.location.href = '/admin-login';
    }
  };

  const resetTimers = () => {
    // Hide warning and clear both existing timers
    setShowWarning(false);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    // Start the 9-minute warning timer
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      // Once warning shows, start the final 60-second logout timer
      logoutTimerRef.current = setTimeout(handleLogout, 60 * 1000);
    }, WARNING_TIME);
  };

  useEffect(() => {
    const events = ['keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimers));
    
    resetTimers(); // Initialize on mount

    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimers));
    };
  }, []);

  return (
    <>
      {children}
      
      {/* Simple Warning Modal */}
      {showWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
            <h2>Session Expiring</h2>
            <p>You have been inactive. You will be logged out in 60 seconds.</p>
            <button 
              onClick={resetTimers}
              style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Stay Logged In
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoLogout;