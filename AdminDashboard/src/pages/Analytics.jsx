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
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [selectedLineStatus, setSelectedLineStatus] = useState('Submitted');

  useEffect(() => {
    setActiveTooltip(null);
  }, [isWeekly, selectedTypeFilter, selectedLineStatus]);

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

  const submittedChartStats = {
    current: approvedChartStats.current + pendingChartStats.current + soldChartStats.current + rejectedChartStats.current,
    previous: approvedChartStats.previous + pendingChartStats.previous + soldChartStats.previous + rejectedChartStats.previous
  };

  const maxChartValue = Math.max(
    submittedChartStats.current, submittedChartStats.previous,
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

  const submittedDetailedStats = {
    House: {
      current: approvedDetailedStats.House.current + pendingDetailedStats.House.current + soldDetailedStats.House.current + rejectedDetailedStats.House.current,
      previous: approvedDetailedStats.House.previous + pendingDetailedStats.House.previous + soldDetailedStats.House.previous + rejectedDetailedStats.House.previous
    },
    Apartment: {
      current: approvedDetailedStats.Apartment.current + pendingDetailedStats.Apartment.current + soldDetailedStats.Apartment.current + rejectedDetailedStats.Apartment.current,
      previous: approvedDetailedStats.Apartment.previous + pendingDetailedStats.Apartment.previous + soldDetailedStats.Apartment.previous + rejectedDetailedStats.Apartment.previous
    },
    Land: {
      current: approvedDetailedStats.Land.current + pendingDetailedStats.Land.current + soldDetailedStats.Land.current + rejectedDetailedStats.Land.current,
      previous: approvedDetailedStats.Land.previous + pendingDetailedStats.Land.previous + soldDetailedStats.Land.previous + rejectedDetailedStats.Land.previous
    }
  };

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

  const renderShareBadge = (current, total, status) => {
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    let badgeClass = styles.trendFlat;
    if (status === 'approved' && percent > 0) badgeClass = styles.trendUp;
    if (status === 'sold' && percent > 0) badgeClass = styles.trendUp;
    if (status === 'rejected' && percent > 0) badgeClass = styles.trendDown;
    return <span className={`${styles.trendPill} ${badgeClass}`}>{percent}%</span>;
  };

  const getLineChartData = () => {
    const numPoints = isWeekly ? 7 : 30;
    const dataPoints = [];
    const now = new Date();
    
    // Generate dates backwards and push in chronological order
    for (let i = numPoints - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      d.setHours(0, 0, 0, 0);
      dataPoints.push({
        date: d,
        label: isWeekly 
          ? d.toLocaleDateString(undefined, { weekday: 'short' })
          : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        House: 0,
        Apartment: 0,
        Land: 0
      });
    }

    const allItems = [
      ...listings.map(item => ({ ...item, listType: 'listings' })),
      ...rejected.map(item => ({ ...item, listType: 'rejected' })),
      ...sold.map(item => ({ ...item, listType: 'sold' }))
    ];

    allItems.forEach(item => {
      const dateStr = item.created_at;
      if (!dateStr) return;
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      
      // Calculate diff in days
      const diffTime = now.setHours(0, 0, 0, 0) - date.getTime();
      const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
      
      if (diffDays >= 0 && diffDays < numPoints) {
        const index = (numPoints - 1) - diffDays;
        if (dataPoints[index]) {
          const type = item.type; // 'House', 'Apartment', 'Land'
          if (type === 'House' || type === 'Apartment' || type === 'Land') {
            let matchesStatus = false;
            if (selectedLineStatus === 'Submitted') {
              matchesStatus = true;
            } else if (selectedLineStatus === 'Rejected' && item.listType === 'rejected') {
              matchesStatus = true;
            } else if (selectedLineStatus === 'Sold' && item.listType === 'sold') {
              matchesStatus = true;
            } else if (item.listType === 'listings') {
              const desc = item.description || '';
              const isPending = desc.includes('Status: Pending');
              if (selectedLineStatus === 'Pending' && isPending) {
                matchesStatus = true;
              } else if (selectedLineStatus === 'Approved' && !isPending) {
                matchesStatus = true;
              }
            }

            if (matchesStatus) {
              dataPoints[index][type]++;
            }
          }
        }
      }
    });

    return dataPoints;
  };

  const renderLineChart = () => {
    const data = getLineChartData();
    const typeConfigs = [
      { key: 'House', color: 'var(--color-primary)', label: 'Houses' },
      { key: 'Apartment', color: 'var(--color-secondary)', label: 'Apartments' },
      { key: 'Land', color: 'var(--color-whatsapp)', label: 'Lands' }
    ];

    const maxVal = Math.max(
      ...data.map(d => Math.max(d.House, d.Apartment, d.Land)),
      1
    );

    // Calculate clean integer intervals for y-axis
    let tickInterval = 1;
    if (maxVal > 5) {
      tickInterval = Math.ceil(maxVal / 5);
    }
    const maxTickVal = Math.ceil(maxVal / tickInterval) * tickInterval;

    const width = 600;
    const height = 240;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const numPoints = data.length;

    // Helper to get coordinates
    const getCoords = (val, idx) => {
      const x = paddingLeft + (idx / (numPoints - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (val / maxTickVal) * chartHeight;
      return { x, y };
    };

    // Generate grid lines (discrete integer values)
    const yGridLines = [];
    for (let val = 0; val <= maxTickVal; val += tickInterval) {
      const y = paddingTop + chartHeight - (val / maxTickVal) * chartHeight;
      yGridLines.push({ y, val });
    }

    return (
      <div 
        style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
        onClick={() => setActiveTooltip(null)}
      >
        {/* Status Filter Tab Group (matches screenshot styling) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div className={styles.categoryGroup}>
            {['Submitted', 'Approved', 'Pending', 'Sold', 'Rejected'].map(status => (
              <button
                key={status}
                className={`${styles.categoryBtn} ${selectedLineStatus === status ? styles.categoryBtnActive : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLineStatus(status);
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ overflow: 'visible' }}>
          {/* Background rect to dismiss tooltip */}
          <rect 
            x={0} 
            y={0} 
            width={width} 
            height={height} 
            fill="transparent" 
            onClick={() => setActiveTooltip(null)} 
          />

          {/* Grid lines */}
          {yGridLines.map((line, idx) => (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={line.y} 
                x2={width - paddingRight} 
                y2={line.y} 
                stroke="var(--color-outline-variant)" 
                strokeDasharray="4 4" 
              />
              <text 
                x={paddingLeft - 8} 
                y={line.y + 4} 
                textAnchor="end" 
                fontSize="10px" 
                fontWeight="700"
                fill="var(--color-text-muted)"
              >
                {line.val}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {data.map((d, idx) => {
            if (numPoints === 30 && idx % 5 !== 0 && idx !== numPoints - 1) return null;
            const x = paddingLeft + (idx / (numPoints - 1)) * chartWidth;
            return (
              <text 
                key={idx}
                x={x} 
                y={height - paddingBottom + 20} 
                textAnchor="middle" 
                fontSize="10px" 
                fontWeight="700"
                fill="var(--color-text-muted)"
              >
                {d.label}
              </text>
            );
          })}

          {/* Lines */}
          {typeConfigs.map(cfg => {
            const pathStr = data.map((d, i) => {
              const { x, y } = getCoords(d[cfg.key], i);
              return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
            }).join(' ');

            return (
              <path 
                key={cfg.key}
                d={pathStr} 
                fill="none" 
                stroke={cfg.color} 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            );
          })}

          {/* Data point circles */}
          {data.map((d, i) => {
            if (numPoints === 30 && i % 5 !== 0 && i !== numPoints - 1) return null;

            return typeConfigs.map(cfg => {
              const val = d[cfg.key];
              const { x, y } = getCoords(val, i);
              const isCurrentActive = activeTooltip && activeTooltip.index === i && activeTooltip.status === cfg.label;

              return (
                <g key={`${cfg.key}-${i}`}>
                  {/* Invisible touch target circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r="10"
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTooltip({
                        index: i,
                        x,
                        y,
                        label: d.label,
                        status: cfg.label,
                        value: val,
                        color: cfg.color
                      });
                    }}
                  />
                  {/* Visible data point dot */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isCurrentActive ? "6" : "4"} 
                    fill={cfg.color} 
                    stroke="white" 
                    strokeWidth={isCurrentActive ? "2" : "1"} 
                    style={{ pointerEvents: 'none', transition: 'all 0.2s ease' }}
                  />
                </g>
              );
            });
          })}

          {/* Floating Tooltip inside SVG */}
          {activeTooltip && (
            <g style={{ transition: 'all 0.2s ease' }}>
              {/* Background card */}
              <rect
                x={activeTooltip.x - 70}
                y={activeTooltip.y - 45}
                width="140"
                height="36"
                rx="6"
                fill="var(--color-primary-dark)"
                style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.25))' }}
              />
              {/* Down-pointing arrow */}
              <polygon
                points={`${activeTooltip.x - 6},${activeTooltip.y - 10} ${activeTooltip.x + 6},${activeTooltip.y - 10} ${activeTooltip.x},${activeTooltip.y - 4}`}
                fill="var(--color-primary-dark)"
              />
              {/* Label */}
              <text
                x={activeTooltip.x}
                y={activeTooltip.y - 32}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10px"
                fontWeight="700"
                opacity="0.85"
              >
                {activeTooltip.label}
              </text>
              {/* Value with matching category color */}
              <text
                x={activeTooltip.x}
                y={activeTooltip.y - 18}
                textAnchor="middle"
                fill={activeTooltip.color}
                fontSize="11px"
                fontWeight="800"
              >
                {activeTooltip.status}: {activeTooltip.value}
              </text>
            </g>
          )}
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {typeConfigs.map(cfg => (
            <div key={cfg.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: cfg.color, borderRadius: '50%' }}></div>
              <span style={{ fontWeight: '700' }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
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
            {/* Submitted Group */}
            <div className={styles.chartGroup}>
              <div className={styles.barGroup}>
                <div className={styles.barWrapper}>
                  <div className={styles.barValue}>{submittedChartStats.current}</div>
                  <div 
                    className={`${styles.chartBar} ${styles.barSubmitted}`}
                    style={{ height: getChartHeight(submittedChartStats.current) }}
                  ></div>
                </div>
                <div className={styles.barWrapper}>
                  <div className={styles.barValue}>{submittedChartStats.previous}</div>
                  <div 
                    className={`${styles.chartBar} ${styles.barPrevious}`}
                    style={{ height: getChartHeight(submittedChartStats.previous) }}
                  ></div>
                </div>
              </div>
              <div className={styles.chartGroupLabel}>
                <i className="bx bx-list-plus" style={{ color: '#4f46e5' }}></i> Submitted
              </div>
            </div>

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

      {/* Property Types Comparison Line Chart */}
      <div className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>
            <h3>Property Submissions Comparison</h3>
            <p>
              Compare Houses, Apartments, and Lands submitted over time ({isWeekly ? 'Last 7 Days' : 'Last 30 Days'}) filtered by status
            </p>
          </div>
        </div>
        {renderLineChart()}
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
                    <strong>{approvedDetailedStats.House.current}</strong> vs {submittedDetailedStats.House.current}
                  </span>
                  {renderShareBadge(approvedDetailedStats.House.current, submittedDetailedStats.House.current, 'approved')}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(approvedDetailedStats.House.current / Math.max(submittedDetailedStats.House.current, 1)) * 100}%`,
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
                    <strong>{approvedDetailedStats.Apartment.current}</strong> vs {submittedDetailedStats.Apartment.current}
                  </span>
                  {renderShareBadge(approvedDetailedStats.Apartment.current, submittedDetailedStats.Apartment.current, 'approved')}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(approvedDetailedStats.Apartment.current / Math.max(submittedDetailedStats.Apartment.current, 1)) * 100}%`,
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
                    <strong>{approvedDetailedStats.Land.current}</strong> vs {submittedDetailedStats.Land.current}
                  </span>
                  {renderShareBadge(approvedDetailedStats.Land.current, submittedDetailedStats.Land.current, 'approved')}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(approvedDetailedStats.Land.current / Math.max(submittedDetailedStats.Land.current, 1)) * 100}%`,
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
                    <strong>{pendingDetailedStats.House.current}</strong> vs {submittedDetailedStats.House.current}
                  </span>
                  {renderShareBadge(pendingDetailedStats.House.current, submittedDetailedStats.House.current, 'pending')}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(pendingDetailedStats.House.current / Math.max(submittedDetailedStats.House.current, 1)) * 100}%`,
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
                    <strong>{pendingDetailedStats.Apartment.current}</strong> vs {submittedDetailedStats.Apartment.current}
                  </span>
                  {renderShareBadge(pendingDetailedStats.Apartment.current, submittedDetailedStats.Apartment.current, 'pending')}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(pendingDetailedStats.Apartment.current / Math.max(submittedDetailedStats.Apartment.current, 1)) * 100}%`,
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
                    <strong>{pendingDetailedStats.Land.current}</strong> vs {submittedDetailedStats.Land.current}
                  </span>
                  {renderShareBadge(pendingDetailedStats.Land.current, submittedDetailedStats.Land.current, 'pending')}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(pendingDetailedStats.Land.current / Math.max(submittedDetailedStats.Land.current, 1)) * 100}%`,
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
                    <strong>{soldDetailedStats.House.current}</strong> vs {submittedDetailedStats.House.current}
                  </span>
                  {renderShareBadge(soldDetailedStats.House.current, submittedDetailedStats.House.current, 'sold')}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(soldDetailedStats.House.current / Math.max(submittedDetailedStats.House.current, 1)) * 100}%`,
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
                    <strong>{soldDetailedStats.Apartment.current}</strong> vs {submittedDetailedStats.Apartment.current}
                  </span>
                  {renderShareBadge(soldDetailedStats.Apartment.current, submittedDetailedStats.Apartment.current, 'sold')}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(soldDetailedStats.Apartment.current / Math.max(submittedDetailedStats.Apartment.current, 1)) * 100}%`,
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
                    <strong>{soldDetailedStats.Land.current}</strong> vs {submittedDetailedStats.Land.current}
                  </span>
                  {renderShareBadge(soldDetailedStats.Land.current, submittedDetailedStats.Land.current, 'sold')}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(soldDetailedStats.Land.current / Math.max(submittedDetailedStats.Land.current, 1)) * 100}%`,
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
                    <strong>{rejectedDetailedStats.House.current}</strong> vs {submittedDetailedStats.House.current}
                  </span>
                  {renderShareBadge(rejectedDetailedStats.House.current, submittedDetailedStats.House.current, 'rejected')}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(rejectedDetailedStats.House.current / Math.max(submittedDetailedStats.House.current, 1)) * 100}%`,
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
                    <strong>{rejectedDetailedStats.Apartment.current}</strong> vs {submittedDetailedStats.Apartment.current}
                  </span>
                  {renderShareBadge(rejectedDetailedStats.Apartment.current, submittedDetailedStats.Apartment.current, 'rejected')}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(rejectedDetailedStats.Apartment.current / Math.max(submittedDetailedStats.Apartment.current, 1)) * 100}%`,
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
                    <strong>{rejectedDetailedStats.Land.current}</strong> vs {submittedDetailedStats.Land.current}
                  </span>
                  {renderShareBadge(rejectedDetailedStats.Land.current, submittedDetailedStats.Land.current, 'rejected')}
                </div>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ 
                      width: `${(rejectedDetailedStats.Land.current / Math.max(submittedDetailedStats.Land.current, 1)) * 100}%`,
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
