import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// --- Helper Function for API Calls ---
async function apiCall(url, method = 'GET', body = null) {
  const apiUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? '' : '/'}${url}`;
  const options = { method, headers: {} };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(apiUrl, options);
  if (!response.ok) {
    throw new Error();
  }

  return await response.json();
}

/**
 * Page for Platform Managers to generate and view platform usage reports.
 */
function PlatformReportsPage() {
  // --- State Variables ---
  const [activeTab, setActiveTab] = useState('welcome'); // 'welcome', 'daily', 'weekly', 'monthly'
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [reportData, setReportData] = useState(null);

  // Daily Report State
  const [dailyDate, setDailyDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Weekly Report State
  const [weeklySelectedDate, setWeeklySelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [weeklyDisplayRange, setWeeklyDisplayRange] = useState('');
  const [weeklyMondayForApi, setWeeklyMondayForApi] = useState('');

  // Monthly Report State
  const currentYear = new Date().getFullYear();
  const [monthlyYear, setMonthlyYear] = useState(currentYear);
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1); // 1-12 for API

  // --- Helper Functions ---
  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
  }, []);

  const clearMessagesAndReport = useCallback(() => {
    setMessage({ text: '', type: '' });
    setReportData(null);
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    clearMessagesAndReport();
  };

  // --- Date Formatting Helper ---
  const formatDateForDisplayOrApi = (dateObj) => {
    return dateObj.toISOString().split('T')[0];
  };


  // --- Weekly Report Date Logic ---
  /**
   * Format a Date object as a local YYYY-MM-DD string
   * (avoids the UTC shift of toISOString).
   */
  function formatLocalDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const calculateWeekRangeAndMonday = useCallback((selectedDateStr) => {
    if (!selectedDateStr) {
      setWeeklyDisplayRange('');
      setWeeklyMondayForApi('');
      return;
    }

    // Parse in local time
    const selected = new Date(selectedDateStr + 'T00:00:00');
    const dayOfWeek = selected.getDay(); // Sun=0, Mon=1, …, Sat=6

    // Roll back to local Monday
    const monday = new Date(selected);
    monday.setDate(
      selected.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    );

    // Compute the Sunday of that week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Use local formatter to avoid timezone shifts
    const mondayStr = formatLocalDate(monday);
    const sundayStr = formatLocalDate(sunday);

    setWeeklyMondayForApi(mondayStr);
    setWeeklyDisplayRange(`From ${mondayStr} to ${sundayStr}`);
  }, []);

  useEffect(() => {
    // Initialize for weekly tab on first load or when weeklySelectedDate changes
    calculateWeekRangeAndMonday(weeklySelectedDate);
  }, [weeklySelectedDate, calculateWeekRangeAndMonday]);

  // --- API Call Handlers ---
  const handleGenerateDailyReport = async () => {
    if (!dailyDate) {
      showMessage('Please select a date for the daily report.', 'error');
      return;
    }
    setIsLoading(true);
    clearMessagesAndReport();
    try {
      const data = await apiCall(`/api/platform/report/daily/${dailyDate}`);
      setReportData(data);
      if (!data) {
        showMessage('No data returned, or an issue occurred fetching the report.', 'info');
        setReportData(null);
      }
    } catch (error) {
      showMessage('Failed to generate daily report.', 'error');
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWeeklyReport = async () => {
    if (!weeklyMondayForApi) {
      showMessage('Please select a date to determine the week for the report.', 'error');
      return;
    }
    setIsLoading(true);
    clearMessagesAndReport();
    try {
      const data = await apiCall(`/api/platform/report/weekly/${weeklyMondayForApi}`);
      setReportData(data);
      if (!data) {
        showMessage('No data returned, or an issue occurred fetching the report.', 'info');
        setReportData(null);
      }
    } catch (error) {
      showMessage('Failed to generate weekly report.', 'error');
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMonthlyReport = async () => {
    setIsLoading(true);
    clearMessagesAndReport();
    try {
      const data = await apiCall(`/api/platform/report/monthly/${monthlyYear}/${monthlyMonth}`);
      setReportData(data);
      if (!data) {
        showMessage('No data returned, or an issue occurred fetching the report.', 'info');
        setReportData(null);
      }
    } catch (error) {
      showMessage('Failed to generate monthly report.', 'error');
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Report Table ---
  const renderReportTable = (data) => {
    if (!data || data.message) return null; // Don't render table if only a message or no data

    return (
      <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '15px' }}>
        <h4>Report Details:</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Generated At:</td>
            <td style={{ padding: '8px' }}>{new Date(data.generatedAt).toLocaleString()}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Report Period Type:</td>
            <td style={{ padding: '8px' }}>{data.reportPeriodType}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Report Period Identifier:</td>
            <td style={{ padding: '8px' }}>{data.reportPeriodIdentifier}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Active User Accounts:</td>
            <td style={{ padding: '8px' }}>{data.activeUserAccounts}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Active Service Categories:</td>
            <td style={{ padding: '8px' }}>{data.activeServiceCategories}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Active Services:</td>
            <td style={{ padding: '8px' }}>{data.activeServices}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Average Service Price:</td>
            <td style={{ padding: '8px' }}>{formatPrice(data.averageServicePrice)}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Percentage of Services Shortlisted:</td>
            <td style={{ padding: '8px' }}>{formatPercentage(data.percentageServicesShortlisted)}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', fontWeight: 'bold' }}>Number of Bookings in Period:</td>
            <td style={{ padding: '8px' }}>{data.numberOfBookingsInPeriod}</td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // --- Render Options for Monthly Report ---
  const years = [];
  for (let y = currentYear; y >= 2000; y--) {
    years.push(y);
  }
  const months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <Link to="/platform-manager/dashboard" style={{ marginBottom: '15px', display: 'inline-block' }}>← Back to
        Platform Manager Dashboard</Link>
      <h2>Platform Usage Reports</h2>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        {['welcome', 'daily', 'weekly', 'monthly'].map(tabName => (
          <button
            key={tabName}
            onClick={() => handleTabChange(tabName)}
            disabled={activeTab === tabName}
            style={{
              marginRight: '10px', padding: '8px 12px',
              fontWeight: activeTab === tabName ? 'bold' : 'normal',
              borderBottom: activeTab === tabName ? '2px solid blue' : '2px solid transparent',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none', background: 'none', cursor: 'pointer'
            }}
          >
            {tabName.charAt(0).toUpperCase() + tabName.slice(1)} Report
          </button>
        ))}
      </div>

      {/* Feedback Messages */}
      {message.text && (
        <p style={{
          padding: '10px', margin: '10px 0', borderRadius: '4px',
          color: 'white',
          backgroundColor: message.type === 'success' ? 'green' : (message.type === 'info' ? 'darkorange' : 'red')
        }}>
          {message.text}
        </p>
      )}

      {/* Loading Indicator */}
      {isLoading && <p>Loading report data...</p>}

      {/* --- Welcome Tab --- */}
      {activeTab === 'welcome' && (
        <div>
          <h3>Welcome to Platform Reports!</h3>
          <p>Please select a report type (Daily, Weekly, or Monthly) from the tabs above to generate and view platform
            statistics.</p>
          <p>These reports provide insights into user activity, service engagement, and booking trends.</p>
        </div>
      )}

      {/* --- Daily Report Tab --- */}
      {activeTab === 'daily' && (
        <div>
          <h3>Daily Report</h3>
          <label htmlFor="dailyDate">Select Date: </label>
          <input
            type="date"
            id="dailyDate"
            value={dailyDate}
            onChange={(e) => setDailyDate(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <button onClick={handleGenerateDailyReport} disabled={isLoading} style={{ padding: '6px 10px' }}>
            Generate Daily Report
          </button>
        </div>
      )}

      {/* --- Weekly Report Tab --- */}
      {activeTab === 'weekly' && (
        <div>
          <h3>Weekly Report</h3>
          <label htmlFor="weeklyDate">Select any date within the desired week: </label>
          <input
            type="date"
            id="weeklyDate"
            value={weeklySelectedDate}
            onChange={(e) => setWeeklySelectedDate(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          {weeklyDisplayRange &&
            <p style={{ fontStyle: 'italic', margin: '5px 0' }}>Report will cover: {weeklyDisplayRange}</p>}
          <button onClick={handleGenerateWeeklyReport} disabled={isLoading || !weeklyMondayForApi}
                  style={{ padding: '6px 10px' }}>
            Generate Weekly Report
          </button>
        </div>
      )}

      {/* --- Monthly Report Tab --- */}
      {activeTab === 'monthly' && (
        <div>
          <h3>Monthly Report</h3>
          <label htmlFor="monthlyYear">Year: </label>
          <select
            id="monthlyYear"
            value={monthlyYear}
            onChange={(e) => setMonthlyYear(parseInt(e.target.value, 10))}
            style={{ marginRight: '10px', padding: '5px' }}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <label htmlFor="monthlyMonth">Month: </label>
          <select
            id="monthlyMonth"
            value={monthlyMonth}
            onChange={(e) => setMonthlyMonth(parseInt(e.target.value, 10))}
            style={{ marginRight: '10px', padding: '5px' }}
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </select>
          <button onClick={handleGenerateMonthlyReport} disabled={isLoading} style={{ padding: '6px 10px' }}>
            Generate Monthly Report
          </button>
        </div>
      )}

      {/* Display Report Data Table */}
      {!isLoading && reportData && activeTab !== 'welcome' && renderReportTable(reportData)}
    </div>
  );
}

export default PlatformReportsPage;