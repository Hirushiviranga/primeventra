import React, { useState, useEffect } from 'react'
import styles from '../styles/Analytics.module.css'

const getApiUrl = (path) => {
  const base = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://primeventra-vrmv.vercel.app';
  return `${base}${path}`;
};

const getTrend = (current, previous) => {
  if (previous === 0) {
    if (current === 0) return { percent: 0, text: '0%', direction: 'flat' };
    return { percent: 100, text: `+${current}`, direction: 'up' };
  }
  const diff = current - previous;
  const percent = Math.round((diff / previous) * 100);
  if (percent > 0) {
    return { percent, text: `+${percent}%`, direction: 'up' };
  } else if (percent < 0) {
    return { percent: Math.abs(percent), text: `${percent}%`, direction: 'down' };
  } else {
    return { percent: 0, text: '0%', direction: 'flat' };
  }
};

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [isWeekly, setIsWeekly] = useState(true);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All'); // 'All', 'House', 'Apartment', 'Land'

  const [listings, setListings] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [sold, setSold] = useState([]);

  useEffect(() => {
    const fetchListings = fetch(getApiUrl('/api/listings')).then(res => {
      if (!res.ok) throw new Error('Failed to fetch listings');
      return res.json();
    }).catch(err => {
      console.warn("Failed to fetch listings for analytics:", err);
      return [];
    });

    const fetchRejected = fetch(getApiUrl('/api/rejected-properties')).then(res => {
      if (!res.ok) throw new Error('Failed to fetch rejected properties');
      return res.json();
    }).catch(err => {
      console.warn("Failed to fetch rejected properties for analytics:", err);
      return [];
    });

    const fetchSold = fetch(getApiUrl('/api/sold-properties')).then(res => {
      if (!res.ok) throw new Error('Failed to fetch sold properties');
      return res.json();
    }).catch(err => {
      console.warn("Failed to fetch sold properties for analytics:", err);
      return [];
    });

    setLoading(true);
    Promise.all([fetchListings, fetchRejected, fetchSold])
      .then(([listingsData, rejectedData, soldData]) => {
        setListings(listingsData || []);
        setRejected(rejectedData || []);
        setSold(soldData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading analytics:", err);
        setLoading(false);
      });
  }, []);

  // Split listings by status
  const approvedListings = listings.filter(item => {
    const desc = item.description || '';
    return desc.includes('Status: Approved') || !desc.includes('Status: Pending');
  });

  const pendingListings = listings.filter(item => {
    const desc = item.description || '';
    return desc.includes('Status: Pending');
  });

  const rejectedProperties = rejected;
  const soldProperties = sold;

  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const currentThreshold = isWeekly 
    ? new Date(now.getTime() - 7 * oneDayMs)
    : new Date(now.getTime() - 30 * oneDayMs);
    
  const previousThreshold = isWeekly
    ? new Date(now.getTime() - 14 * oneDayMs)
    : new Date(now.getTime() - 60 * oneDayMs);

  // Stats for the chart (filtered by selected property type)
  const getStatsForStatus = (items, selectedType) => {
    const stats = { current: 0, previous: 0 };
    items.forEach(item => {
      if (selectedType !== 'All' && item.type !== selectedType) return;

      const dateStr = item.rejected_at || item.created_at;
      if (!dateStr) return;
      const date = new Date(dateStr);

      if (date >= currentThreshold && date <= now) {
        stats.current++;
      } else if (date >= previousThreshold && date < currentThreshold) {
        stats.previous++;
      }
    });
    return stats;
  };

  const approvedChartStats = getStatsForStatus(approvedListings, selectedTypeFilter);
  const pendingChartStats = getStatsForStatus(pendingListings, selectedTypeFilter);
  const soldChartStats = getStatsForStatus(soldProperties, selectedTypeFilter);
  const rejectedChartStats = getStatsForStatus(rejectedProperties, selectedTypeFilter);

  const maxChartValue = Math.max(
    approvedChartStats.current, approvedChartStats.previous,
    pendingChartStats.current, pendingChartStats.previous,
    soldChartStats.current, soldChartStats.previous,
    rejectedChartStats.current, rejectedChartStats.previous,
    1
  );

  const getChartHeight = (val) => {
    return `${(val / maxChartValue) * 85}%`;
  };

  // Stats for detailed cards (House vs Apartment vs Land)
  const getStatsForDetailedCard = (items) => {
    const stats = {
      House: { current: 0, previous: 0 },
      Apartment: { current: 0, previous: 0 },
      Land: { current: 0, previous: 0 }
    };

    items.forEach(item => {
      const type = item.type; // 'House', 'Apartment', 'Land'
      if (!type || !stats[type]) return;

      const dateStr = item.rejected_at || item.created_at;
      if (!dateStr) return;
      const date = new Date(dateStr);

      if (date >= currentThreshold && date <= now) {
        stats[type].current++;
      } else if (date >= previousThreshold && date < currentThreshold) {
        stats[type].previous++;
      }
    });

    return stats;
  };

  const approvedDetailedStats = getStatsForDetailedCard(approvedListings);
  const pendingDetailedStats = getStatsForDetailedCard(pendingListings);
  const soldDetailedStats = getStatsForDetailedCard(soldProperties);
  const rejectedDetailedStats = getStatsForDetailedCard(rejectedProperties);

  // District breakdown calculation for the current period (This Week / This Month)
  const allDistricts = Array.from(new Set([
    ...listings.map(item => item.district),
    ...rejected.map(item => item.district),
    ...sold.map(item => item.district)
  ])).filter(Boolean);

  const districtData = allDistricts.map(dist => {
    const listedCount = approvedListings.filter(item => {
      if (item.district !== dist) return false;
      const date = new Date(item.rejected_at || item.created_at);
      return date >= currentThreshold && date <= now;
    }).length;

    const soldCount = sold.filter(item => {
      if (item.district !== dist) return false;
      const date = new Date(item.rejected_at || item.created_at);
      return date >= currentThreshold && date <= now;
    }).length;

    const rejectedCount = rejected.filter(item => {
      if (item.district !== dist) return false;
      const date = new Date(item.rejected_at || item.created_at);
      return date >= currentThreshold && date <= now;
    }).length;

    return {
      name: dist,
      listed: listedCount,
      sold: soldCount,
      rejected: rejectedCount,
      total: listedCount + soldCount + rejectedCount
    };
  })
  .filter(d => d.total > 0)
  .sort((a, b) => b.total - a.total);

  const renderTrendBadge = (current, previous) => {
    const trend = getTrend(current, previous);
    if (trend.direction === 'up') {
      return <span className={`${styles.trendPill} ${styles.trendUp}`}><i className="bx bx-trending-up"></i> {trend.text}</span>;
    }
    if (trend.direction === 'down') {
      return <span className={`${styles.trendPill} ${styles.trendDown}`}><i className="bx bx-trending-down"></i> {trend.text}</span>;
    }
    return <span className={`${styles.trendPill} ${styles.trendFlat}`}>{trend.text}</span>;
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loadingSpinner}></div>
        <p>Calculating property trends...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Property Analytics</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>
            Compare Listed, Pending, Sold, and Rejected properties weekly and monthly
          </p>
        </div>
        <div className={styles.periodSelector}>
          <button 
            className={`${styles.periodBtn} ${isWeekly ? styles.periodBtnActive : ''}`}
            onClick={() => setIsWeekly(true)}
          >
            Weekly Comparison
          </button>
          <button 
            className={`${styles.periodBtn} ${!isWeekly ? styles.periodBtnActive : ''}`}
            onClick={() => setIsWeekly(false)}
          >
            Monthly Comparison
          </button>
        </div>
      </div>

      {/* Double Bar Chart Comparison */}
      <div className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>
            <h3>Property Status Trends ({selectedTypeFilter} Properties)</h3>
            <p>
              Comparing {isWeekly ? 'This Week vs Last Week' : 'This Month vs Last Month'} across all property states
            </p>
          </div>
          <div className={styles.categoryGroup}>
            <button 
              className={`${styles.categoryBtn} ${selectedTypeFilter === 'All' ? styles.categoryBtnActive : ''}`}
              onClick={() => setSelectedTypeFilter('All')}
            >
              All Types
            </button>
            <button 
              className={`${styles.categoryBtn} ${selectedTypeFilter === 'House' ? styles.categoryBtnActive : ''}`}
              onClick={() => setSelectedTypeFilter('House')}
            >
              House
            </button>
            <button 
              className={`${styles.categoryBtn} ${selectedTypeFilter === 'Apartment' ? styles.categoryBtnActive : ''}`}
              onClick={() => setSelectedTypeFilter('Apartment')}
            >
              Apartment
            </button>
            <button 
              className={`${styles.categoryBtn} ${selectedTypeFilter === 'Land' ? styles.categoryBtnActive : ''}`}
              onClick={() => setSelectedTypeFilter('Land')}
            >
              Land
            </button>
          </div>
        </div>

        <div className={styles.chartBody}>
          <div className={styles.gridLines}>
            <div className={styles.gridLine}></div>
            <div className={styles.gridLine}></div>
            <div className={styles.gridLine}></div>
            <div className={styles.gridLine}></div>
          </div>

          <div className={styles.barGroupContainer}>
            {/* Approved Group */}
            <div className={styles.chartGroup}>
              <div className={styles.barGroup}>
                <div className={styles.barWrapper}>
                  <div className={styles.barValue}>{approvedChartStats.current}</div>
                  <div 
                    className={`${styles.chartBar} ${styles.barCurrent}`}
                    style={{ height: getChartHeight(approvedChartStats.current) }}
                  ></div>
                </div>
                <div className={styles.barWrapper}>
                  <div className={styles.barValue}>{approvedChartStats.previous}</div>
                  <div 
                    className={`${styles.chartBar} ${styles.barPrevious}`}
                    style={{ height: getChartHeight(approvedChartStats.previous) }}
                  ></div>
                </div>
              </div>
              <div className={styles.chartGroupLabel}>
                <i className="bx bx-check-shield" style={{ color: 'var(--color-primary)' }}></i> Approved
              </div>
            </div>

            {/* Pending Group */}
            <div className={styles.chartGroup}>
              <div className={styles.barGroup}>
                <div className={styles.barWrapper}>
                  <div className={styles.barValue}>{pendingChartStats.current}</div>
                  <div 
                    className={`${styles.chartBar} ${styles.barCurrent}`}
                    style={{ height: getChartHeight(pendingChartStats.current) }}
                  ></div>
                </div>
                <div className={styles.barWrapper}>
                  <div className={styles.barValue}>{pendingChartStats.previous}</div>
                  <div 
                    className={`${styles.chartBar} ${styles.barPrevious}`}
                    style={{ height: getChartHeight(pendingChartStats.previous) }}
                  ></div>
                </div>
              </div>
              <div className={styles.chartGroupLabel}>
                <i className="bx bx-time" style={{ color: '#b06000' }}></i> Pending
              </div>
            </div>

            {/* Sold Group */}
            <div className={styles.chartGroup}>
              <div className={styles.barGroup}>
                <div className={styles.barWrapper}>
                  <div className={styles.barValue}>{soldChartStats.current}</div>
                  <div 
                    className={`${styles.chartBar} ${styles.barCurrent}`}
                    style={{ height: getChartHeight(soldChartStats.current) }}
                  ></div>
                </div>
                <div className={styles.barWrapper}>
                  <div className={styles.barValue}>{soldChartStats.previous}</div>
                  <div 
                    className={`${styles.chartBar} ${styles.barPrevious}`}
                    style={{ height: getChartHeight(soldChartStats.previous) }}
                  ></div>
                </div>
              </div>
              <div className={styles.chartGroupLabel}>
                <i className="bx bx-check-circle" style={{ color: 'var(--color-whatsapp)' }}></i> Sold
              </div>
            </div>

            {/* Rejected Group */}
            <div className={styles.chartGroup}>
              <div className={styles.barGroup}>
                <div className={styles.barWrapper}>
                  <div className={styles.barValue}>{rejectedChartStats.current}</div>
                  <div 
                    className={`${styles.chartBar} ${styles.barCurrent}`}
                    style={{ height: getChartHeight(rejectedChartStats.current) }}
                  ></div>
                </div>
                <div className={styles.barWrapper}>
                  <div className={styles.barValue}>{rejectedChartStats.previous}</div>
                  <div 
                    className={`${styles.chartBar} ${styles.barPrevious}`}
                    style={{ height: getChartHeight(rejectedChartStats.previous) }}
                  ></div>
                </div>
              </div>
              <div className={styles.chartGroupLabel}>
                <i className="bx bx-x-circle" style={{ color: 'var(--color-secondary)' }}></i> Rejected
              </div>
            </div>
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: 'var(--color-primary)' }}></div>
            <span>Current Period ({isWeekly ? 'This Week' : 'This Month'})</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ background: '#bdbdbd' }}></div>
            <span>Previous Period ({isWeekly ? 'Last Week' : 'Last Month'})</span>
          </div>
        </div>
      </div>

      {/* Detailed Card Grid */}
      <div className={styles.comparisonGrid}>
        
        {/* Approved Properties Card */}
        <div className={styles.detailsCard}>
          <div className={`${styles.detailsCardHeader} ${styles.listed}`}>
            <i className="bx bx-check-shield"></i>
            <h3>Approved (Listed)</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className={styles.detailRow}>
              <div className={styles.detailHeader}>
                <span className={styles.detailLabel}><i className="bx bx-home" style={{ color: 'var(--color-primary)' }}></i> House</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.detailCounts}>
                    <strong>{approvedDetailedStats.House.current}</strong> vs {approvedDetailedStats.House.previous}
                  </span>
                  {renderTrendBadge(approvedDetailedStats.House.current, approvedDetailedStats.House.previous)}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(approvedDetailedStats.House.current / Math.max(approvedDetailedStats.House.current + approvedDetailedStats.House.previous, 1)) * 100}%`,
                      background: 'var(--color-primary)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailHeader}>
                <span className={styles.detailLabel}><i className="bx bx-building" style={{ color: 'var(--color-secondary)' }}></i> Apartment</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.detailCounts}>
                    <strong>{approvedDetailedStats.Apartment.current}</strong> vs {approvedDetailedStats.Apartment.previous}
                  </span>
                  {renderTrendBadge(approvedDetailedStats.Apartment.current, approvedDetailedStats.Apartment.previous)}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(approvedDetailedStats.Apartment.current / Math.max(approvedDetailedStats.Apartment.current + approvedDetailedStats.Apartment.previous, 1)) * 100}%`,
                      background: 'var(--color-secondary)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailHeader}>
                <span className={styles.detailLabel}><i className="bx bx-landscape" style={{ color: 'var(--color-tertiary)' }}></i> Land</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.detailCounts}>
                    <strong>{approvedDetailedStats.Land.current}</strong> vs {approvedDetailedStats.Land.previous}
                  </span>
                  {renderTrendBadge(approvedDetailedStats.Land.current, approvedDetailedStats.Land.previous)}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(approvedDetailedStats.Land.current / Math.max(approvedDetailedStats.Land.current + approvedDetailedStats.Land.previous, 1)) * 100}%`,
                      background: 'var(--color-tertiary)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Pending Properties Card */}
        <div className={styles.detailsCard}>
          <div className={`${styles.detailsCardHeader} ${styles.pending}`}>
            <i className="bx bx-time"></i>
            <h3>Pending Approval</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className={styles.detailRow}>
              <div className={styles.detailHeader}>
                <span className={styles.detailLabel}><i className="bx bx-home" style={{ color: 'var(--color-primary)' }}></i> House</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.detailCounts}>
                    <strong>{pendingDetailedStats.House.current}</strong> vs {pendingDetailedStats.House.previous}
                  </span>
                  {renderTrendBadge(pendingDetailedStats.House.current, pendingDetailedStats.House.previous)}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(pendingDetailedStats.House.current / Math.max(pendingDetailedStats.House.current + pendingDetailedStats.House.previous, 1)) * 100}%`,
                      background: 'var(--color-primary)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailHeader}>
                <span className={styles.detailLabel}><i className="bx bx-building" style={{ color: 'var(--color-secondary)' }}></i> Apartment</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.detailCounts}>
                    <strong>{pendingDetailedStats.Apartment.current}</strong> vs {pendingDetailedStats.Apartment.previous}
                  </span>
                  {renderTrendBadge(pendingDetailedStats.Apartment.current, pendingDetailedStats.Apartment.previous)}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(pendingDetailedStats.Apartment.current / Math.max(pendingDetailedStats.Apartment.current + pendingDetailedStats.Apartment.previous, 1)) * 100}%`,
                      background: 'var(--color-secondary)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailHeader}>
                <span className={styles.detailLabel}><i className="bx bx-landscape" style={{ color: 'var(--color-tertiary)' }}></i> Land</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.detailCounts}>
                    <strong>{pendingDetailedStats.Land.current}</strong> vs {pendingDetailedStats.Land.previous}
                  </span>
                  {renderTrendBadge(pendingDetailedStats.Land.current, pendingDetailedStats.Land.previous)}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(pendingDetailedStats.Land.current / Math.max(pendingDetailedStats.Land.current + pendingDetailedStats.Land.previous, 1)) * 100}%`,
                      background: 'var(--color-tertiary)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sold Properties Card */}
        <div className={styles.detailsCard}>
          <div className={`${styles.detailsCardHeader} ${styles.sold}`}>
            <i className="bx bx-check-circle"></i>
            <h3>Sold Properties</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className={styles.detailRow}>
              <div className={styles.detailHeader}>
                <span className={styles.detailLabel}><i className="bx bx-home" style={{ color: 'var(--color-primary)' }}></i> House</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.detailCounts}>
                    <strong>{soldDetailedStats.House.current}</strong> vs {soldDetailedStats.House.previous}
                  </span>
                  {renderTrendBadge(soldDetailedStats.House.current, soldDetailedStats.House.previous)}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(soldDetailedStats.House.current / Math.max(soldDetailedStats.House.current + soldDetailedStats.House.previous, 1)) * 100}%`,
                      background: 'var(--color-whatsapp)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailHeader}>
                <span className={styles.detailLabel}><i className="bx bx-building" style={{ color: 'var(--color-secondary)' }}></i> Apartment</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.detailCounts}>
                    <strong>{soldDetailedStats.Apartment.current}</strong> vs {soldDetailedStats.Apartment.previous}
                  </span>
                  {renderTrendBadge(soldDetailedStats.Apartment.current, soldDetailedStats.Apartment.previous)}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(soldDetailedStats.Apartment.current / Math.max(soldDetailedStats.Apartment.current + soldDetailedStats.Apartment.previous, 1)) * 100}%`,
                      background: 'var(--color-whatsapp)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailHeader}>
                <span className={styles.detailLabel}><i className="bx bx-landscape" style={{ color: 'var(--color-tertiary)' }}></i> Land</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.detailCounts}>
                    <strong>{soldDetailedStats.Land.current}</strong> vs {soldDetailedStats.Land.previous}
                  </span>
                  {renderTrendBadge(soldDetailedStats.Land.current, soldDetailedStats.Land.previous)}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(soldDetailedStats.Land.current / Math.max(soldDetailedStats.Land.current + soldDetailedStats.Land.previous, 1)) * 100}%`,
                      background: 'var(--color-whatsapp)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Rejected Properties Card */}
        <div className={styles.detailsCard}>
          <div className={`${styles.detailsCardHeader} ${styles.rejected}`}>
            <i className="bx bx-x-circle"></i>
            <h3>Rejected Properties</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className={styles.detailRow}>
              <div className={styles.detailHeader}>
                <span className={styles.detailLabel}><i className="bx bx-home" style={{ color: 'var(--color-primary)' }}></i> House</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.detailCounts}>
                    <strong>{rejectedDetailedStats.House.current}</strong> vs {rejectedDetailedStats.House.previous}
                  </span>
                  {renderTrendBadge(rejectedDetailedStats.House.current, rejectedDetailedStats.House.previous)}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(rejectedDetailedStats.House.current / Math.max(rejectedDetailedStats.House.current + rejectedDetailedStats.House.previous, 1)) * 100}%`,
                      background: 'var(--color-secondary)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailHeader}>
                <span className={styles.detailLabel}><i className="bx bx-building" style={{ color: 'var(--color-secondary)' }}></i> Apartment</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.detailCounts}>
                    <strong>{rejectedDetailedStats.Apartment.current}</strong> vs {rejectedDetailedStats.Apartment.previous}
                  </span>
                  {renderTrendBadge(rejectedDetailedStats.Apartment.current, rejectedDetailedStats.Apartment.previous)}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(rejectedDetailedStats.Apartment.current / Math.max(rejectedDetailedStats.Apartment.current + rejectedDetailedStats.Apartment.previous, 1)) * 100}%`,
                      background: 'var(--color-secondary)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailHeader}>
                <span className={styles.detailLabel}><i className="bx bx-landscape" style={{ color: 'var(--color-tertiary)' }}></i> Land</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.detailCounts}>
                    <strong>{rejectedDetailedStats.Land.current}</strong> vs {rejectedDetailedStats.Land.previous}
                  </span>
                  {renderTrendBadge(rejectedDetailedStats.Land.current, rejectedDetailedStats.Land.previous)}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(rejectedDetailedStats.Land.current / Math.max(rejectedDetailedStats.Land.current + rejectedDetailedStats.Land.previous, 1)) * 100}%`,
                      background: 'var(--color-secondary)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* District-wise Breakdown Section */}
      <div className={styles.districtSection}>
        <h3>District Activity Breakdown ({isWeekly ? 'This Week' : 'This Month'})</h3>
        {districtData.length > 0 ? (
          <div className={styles.districtTableWrapper}>
            <table className={styles.districtTable}>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Listed Properties</th>
                  <th>Sold Properties</th>
                  <th>Rejected Properties</th>
                  <th>Total Activity</th>
                </tr>
              </thead>
              <tbody>
                {districtData.map(d => (
                  <tr key={d.name}>
                    <td>
                      <div className={styles.districtNameCell}>
                        <i className="bx bx-map-pin"></i> {d.name}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.districtCountBadge} ${styles.countListed}`}>
                        {d.listed}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.districtCountBadge} ${styles.countSold}`}>
                        {d.sold}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.districtCountBadge} ${styles.countRejected}`}>
                        {d.rejected}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.districtCountBadge} ${styles.countTotal}`}>
                        {d.total}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', margin: '20px 0' }}>
            No property activities recorded in any district during this period.
          </p>
        )}
      </div>
    </div>
  )
}
