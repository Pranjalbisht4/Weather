import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Wind, Waves, Cloud, Navigation, Clock, MapPin, Bell, Filter, CheckCircle, X, RefreshCw, Settings, Download, Archive, Eye, Users, TrendingUp } from 'lucide-react';

// Enhanced Alerts component with black background theme
const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [preferences, setPreferences] = useState({ high: true, medium: true, low: false });
  const [alertStats, setAlertStats] = useState({});
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAlerts();
    
    // Auto-refresh every 5 minutes if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchAlerts, 300000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Enhanced alert data with comprehensive maritime information
      const alertsData = [
        {
          id: 1,
          severity: 'high',
          type: 'storm',
          title: 'Tropical Storm Warning - Alex',
          description: 'Tropical Storm Alex approaching with sustained winds up to 45 knots and wave heights of 5-7 meters. Storm surge expected along coastal areas.',
          location: 'North Atlantic - Zone 7 (35°N, 45°W)',
          coordinates: { lat: 35.0, lon: -45.0 },
          timeIssued: '2 hours ago',
          issueTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          duration: 'Next 18 hours',
          expiryTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
          impact: 'High risk to vessel operations - Category 1 equivalent',
          icon: Cloud,
          acknowledged: false,
          priority: 1,
          source: 'National Hurricane Center',
          recommendations: [
            'Reduce speed to 8-10 knots maximum',
            'Consider immediate alternative routing to safe harbor',
            'Secure all loose equipment and prepare for heavy weather',
            'Maintain continuous radio watch on emergency frequencies',
            'Deploy storm anchor if unable to reach port'
          ],
          affectedVessels: 15,
          windSpeed: 45,
          windGusts: 55,
          waveHeight: 6.5,
          barometricPressure: 985,
          movementDirection: 'NNE',
          movementSpeed: 12,
          riskLevel: 'EXTREME'
        },
        {
          id: 2,
          severity: 'medium',
          type: 'waves',
          title: 'High Wave Advisory',
          description: 'Significant wave heights of 3.5-4.5 meters expected due to strong westerly winds. Combined seas with 8-second period swells.',
          location: 'Gulf of Mexico - Zone 3 (28°N, 90°W)',
          coordinates: { lat: 28.0, lon: -90.0 },
          timeIssued: '4 hours ago',
          issueTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
          duration: 'Next 12 hours',
          expiryTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
          impact: 'Moderate impact on vessel stability and cargo operations',
          icon: Waves,
          acknowledged: false,
          priority: 2,
          source: 'Coast Guard Weather Service',
          recommendations: [
            'Monitor vessel stability and reduce speed as necessary',
            'Secure cargo and check lashings every 2 hours',
            'Ensure proper ballast distribution for wave conditions',
            'Consider delaying small craft operations',
            'Maintain extra lookout for rogue waves'
          ],
          affectedVessels: 8,
          windSpeed: 28,
          windGusts: 35,
          waveHeight: 4.2,
          barometricPressure: 1008,
          swellPeriod: 8,
          riskLevel: 'HIGH'
        },
        {
          id: 3,
          severity: 'medium',
          type: 'wind',
          title: 'Strong Wind Warning',
          description: 'Sustained winds of 25-30 knots with gusts up to 35 knots from the northwest. Cold front passage expected.',
          location: 'Mediterranean Sea - Zone 12 (40°N, 8°E)',
          coordinates: { lat: 40.0, lon: 8.0 },
          timeIssued: '6 hours ago',
          issueTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
          duration: 'Next 8 hours',
          expiryTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
          impact: 'Increased fuel consumption and potential schedule delays',
          icon: Wind,
          acknowledged: true,
          priority: 3,
          source: 'European Maritime Weather Service',
          recommendations: [
            'Adjust course to minimize wind resistance',
            'Monitor fuel consumption closely',
            'Prepare for sudden wind shifts during front passage',
            'Secure deck equipment and close watertight doors',
            'Brief crew on heavy weather procedures'
          ],
          affectedVessels: 12,
          windSpeed: 32,
          windGusts: 42,
          waveHeight: 2.8,
          barometricPressure: 1012,
          windDirection: 'NW',
          riskLevel: 'MODERATE'
        },
        {
          id: 4,
          severity: 'low',
          type: 'current',
          title: 'Strong Current Notice',
          description: 'Ocean current speeds of 1.8-2.2 knots detected, stronger than seasonal normal due to recent storm activity.',
          location: 'Caribbean Sea - Zone 8 (18°N, 75°W)',
          coordinates: { lat: 18.0, lon: -75.0 },
          timeIssued: '8 hours ago',
          issueTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
          duration: 'Next 24 hours',
          expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          impact: 'Minor impact on ETA calculations and fuel planning',
          icon: Navigation,
          acknowledged: false,
          priority: 4,
          source: 'Oceanographic Institute',
          recommendations: [
            'Update navigation calculations for current drift',
            'Consider utilizing current assistance where possible',
            'Monitor GPS position more frequently',
            'Adjust departure times for optimal current windows',
            'Brief navigation team on current conditions'
          ],
          affectedVessels: 5,
          windSpeed: 15,
          windGusts: 20,
          waveHeight: 1.2,
          currentSpeed: 2.0,
          currentDirection: 'WSW',
          riskLevel: 'LOW'
        },
        {
          id: 5,
          severity: 'high',
          type: 'cyclone',
          title: 'Tropical Cyclone Development Watch',
          description: 'Tropical cyclone formation probable within 48 hours. Current disturbance showing rapid organization with potential for Category 1-2 development.',
          location: 'Indian Ocean - Zone 15 (15°S, 75°E)',
          coordinates: { lat: -15.0, lon: 75.0 },
          timeIssued: '1 hour ago',
          issueTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
          duration: 'Next 48 hours',
          expiryTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
          impact: 'Potential severe disruption to all maritime operations',
          icon: AlertTriangle,
          acknowledged: false,
          priority: 1,
          source: 'Regional Meteorological Centre',
          recommendations: [
            'Monitor tropical cyclone bulletins every 3 hours',
            'Prepare detailed contingency and evacuation plans',
            'Consider postponing all non-essential departures',
            'Ensure emergency equipment is readily accessible',
            'Establish enhanced communication schedules'
          ],
          affectedVessels: 23,
          windSpeed: 40,
          windGusts: 50,
          waveHeight: 5.8,
          barometricPressure: 995,
          cycloneCategory: 'Developing',
          riskLevel: 'EXTREME'
        },
        {
          id: 6,
          severity: 'medium',
          type: 'visibility',
          title: 'Dense Fog Advisory',
          description: 'Dense fog with visibility reduced to 0.5-1.0 nautical miles. Fog bank persisting due to temperature inversion.',
          location: 'English Channel - Dover Strait',
          coordinates: { lat: 50.9, lon: 1.4 },
          timeIssued: '3 hours ago',
          issueTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
          duration: 'Next 6 hours',
          expiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
          impact: 'Severe restrictions on vessel traffic and port operations',
          icon: Cloud,
          acknowledged: false,
          priority: 2,
          source: 'Maritime Traffic Control',
          recommendations: [
            'Reduce speed to safe navigation levels',
            'Maintain continuous radar and AIS monitoring',
            'Sound fog signals as required by COLREGS',
            'Post additional lookouts if available',
            'Consider anchoring in safe water until visibility improves'
          ],
          affectedVessels: 18,
          windSpeed: 8,
          waveHeight: 0.8,
          visibility: 0.7,
          riskLevel: 'HIGH'
        }
      ];
      
      setAlerts(alertsData);
      
      // Calculate statistics
      const stats = {
        total: alertsData.length,
        unacknowledged: alertsData.filter(a => !a.acknowledged).length,
        high: alertsData.filter(a => a.severity === 'high').length,
        medium: alertsData.filter(a => a.severity === 'medium').length,
        low: alertsData.filter(a => a.severity === 'low').length,
        affectedVessels: alertsData.reduce((sum, a) => sum + a.affectedVessels, 0)
      };
      setAlertStats(stats);
      
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getSeverityBorder = (severity) => {
    switch (severity) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'EXTREME': return 'text-red-400 bg-red-900';
      case 'HIGH': return 'text-orange-400 bg-orange-900';
      case 'MODERATE': return 'text-yellow-400 bg-yellow-900';
      case 'LOW': return 'text-green-400 bg-green-900';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  const getShakeAnimation = (severity) => {
    return severity === 'high' ? 'animate-pulse' : '';
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unacknowledged') return !alert.acknowledged;
    if (filter === 'active') return new Date() < alert.expiryTime;
    return alert.severity === filter;
  });

  // Enhanced button handlers with comprehensive functionality
  const viewDetails = (alert) => {
    setSelectedAlert(alert);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAlert(null);
  };

  const formatTime = (date) => {
    return date.toLocaleString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const acknowledge = async (id) => {
    try {
      const response = await fetch("http://localhost:5000/api/alerts/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      
      if (response.ok) {
        setAlerts(alerts.map(alert => 
          alert.id === id ? { ...alert, acknowledged: true } : alert
        ));
        alert(`✅ Alert ${id} has been successfully acknowledged.\n\nReminder: Acknowledging an alert indicates you have reviewed and understood the warning. Continue to monitor conditions and follow all safety recommendations.`);
      }
    } catch (err) {
      alert("❌ Failed to acknowledge alert. Please check your connection and try again.");
    }
  };

  const acknowledgeAll = async () => {
    const unacknowledgedIds = alerts.filter(a => !a.acknowledged).map(a => a.id);
    
    if (unacknowledgedIds.length === 0) {
      alert("ℹ️ No unacknowledged alerts to process.");
      return;
    }

    if (!confirm(`Are you sure you want to acknowledge all ${unacknowledgedIds.length} unacknowledged alerts?\n\nThis action confirms you have reviewed all warnings and understand the associated risks.`)) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/alerts/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unacknowledgedIds }),
      });
      
      if (response.ok) {
        setAlerts(alerts.map(alert => ({ ...alert, acknowledged: true })));
        alert(`✅ Successfully acknowledged all ${unacknowledgedIds.length} alerts.\n\nAll maritime warnings have been processed. Continue monitoring conditions and follow safety protocols.`);
      }
    } catch (err) {
      alert("❌ Failed to acknowledge alerts. Please try again.");
    }
  };

  const dismissAlert = (id) => {
    const alert_item = alerts.find(a => a.id === id);
    
    if (!confirm(`Are you sure you want to dismiss this alert?\n\n"${alert_item?.title}"\n\nDismissed alerts will be removed from your active dashboard but remain in system logs.`)) {
      return;
    }

    setAlerts(alerts.filter(alert => alert.id !== id));
    alert(`🗑️ Alert "${alert_item?.title}" has been dismissed from your dashboard.\n\nNote: This alert remains in system archives and may be referenced for historical analysis.`);
  };

  const configurePreferences = async () => {
    const currentPrefs = { ...preferences };
    
    const newPrefs = {
      high: confirm("📢 HIGH SEVERITY ALERTS\n\nReceive notifications for extreme weather events, storm warnings, and critical safety threats?\n\nRecommended: YES for all maritime operations."),
      medium: confirm("📢 MEDIUM SEVERITY ALERTS\n\nReceive notifications for moderate weather conditions, advisories, and operational impacts?\n\nRecommended: YES for most maritime activities."),
      low: confirm("📢 LOW SEVERITY ALERTS\n\nReceive notifications for minor conditions, routine advisories, and general information?\n\nNote: May result in frequent notifications."),
      autoRefresh: confirm("🔄 AUTO-REFRESH\n\nAutomatically refresh alert data every 5 minutes?\n\nRecommended: YES for active operations."),
      sounds: confirm("🔊 AUDIO NOTIFICATIONS\n\nEnable sound alerts for new high-priority maritime warnings?\n\nRecommended: YES for bridge operations.")
    };

    setPreferences(newPrefs);
    setAutoRefresh(newPrefs.autoRefresh);

    try {
      const response = await fetch("http://localhost:5000/api/alerts/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrefs),
      });
      
      if (response.ok) {
        alert(`⚙️ Alert Preferences Updated Successfully\n\n📊 Your notification settings:\n• High Severity: ${newPrefs.high ? 'ENABLED' : 'DISABLED'}\n• Medium Severity: ${newPrefs.medium ? 'ENABLED' : 'DISABLED'}\n• Low Severity: ${newPrefs.low ? 'ENABLED' : 'DISABLED'}\n• Auto-Refresh: ${newPrefs.autoRefresh ? 'ENABLED' : 'DISABLED'}\n• Audio Alerts: ${newPrefs.sounds ? 'ENABLED' : 'DISABLED'}\n\nChanges are effective immediately.`);
      }
    } catch (err) {
      alert("❌ Failed to update preferences. Settings saved locally but may not sync with server.");
    }
  };

  const exportAlerts = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const alertsCSV = [
      'ID,Title,Severity,Risk Level,Location,Coordinates,Time Issued,Duration,Impact,Wind Speed,Wave Height,Affected Vessels,Acknowledged,Source',
      ...filteredAlerts.map(alert => 
        `${alert.id},"${alert.title}",${alert.severity},${alert.riskLevel},"${alert.location}","${alert.coordinates ? `${alert.coordinates.lat}, ${alert.coordinates.lon}` : ''}",${alert.issueTime.toISOString()},${alert.duration},"${alert.impact}",${alert.windSpeed},${alert.waveHeight},${alert.affectedVessels},${alert.acknowledged ? 'Yes' : 'No'},"${alert.source}"`
      )
    ].join('\n');
    
    const blob = new Blob([alertsCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maritime-alerts-${timestamp}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-3 text-lg text-gray-300">Loading maritime alert system...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                Maritime Alert Intelligence Dashboard
              </h1>
              <p className="text-gray-300 mt-2">
                Real-time maritime weather warnings and safety notifications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setNotifications(!notifications)}
                variant={notifications ? "default" : "outline"}
                className="flex items-center gap-2 bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
              >
                <Bell className="h-4 w-4" />
                {notifications ? 'ON' : 'OFF'}
              </Button>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                className="flex items-center gap-2 bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
                Auto
              </Button>
            </div>
          </div>

          {/* Enhanced Statistics Panel */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <Card className="p-3 bg-gray-900 border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{alertStats.total || 0}</div>
                <div className="text-sm text-gray-400">Total Alerts</div>
              </div>
            </Card>
            <Card className="p-3 bg-gray-900 border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{alertStats.unacknowledged || 0}</div>
                <div className="text-sm text-gray-400">Unacknowledged</div>
              </div>
            </Card>
            <Card className="p-3 bg-gray-900 border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{alertStats.high || 0}</div>
                <div className="text-sm text-gray-400">High Severity</div>
              </div>
            </Card>
            <Card className="p-3 bg-gray-900 border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{alertStats.medium || 0}</div>
                <div className="text-sm text-gray-400">Medium Severity</div>
              </div>
            </Card>
            <Card className="p-3 bg-gray-900 border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{alertStats.low || 0}</div>
                <div className="text-sm text-gray-400">Low Severity</div>
              </div>
            </Card>
            <Card className="p-3 bg-gray-900 border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{alertStats.affectedVessels || 0}</div>
                <div className="text-sm text-gray-400">Vessels Affected</div>
              </div>
            </Card>
          </div>

          {/* Enhanced Control Panel */}
          <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Alerts ({alerts.length})</option>
                  <option value="high">High Severity ({alerts.filter(a => a.severity === 'high').length})</option>
                  <option value="medium">Medium Severity ({alerts.filter(a => a.severity === 'medium').length})</option>
                  <option value="low">Low Severity ({alerts.filter(a => a.severity === 'low').length})</option>
                  <option value="unacknowledged">Unacknowledged ({alerts.filter(a => !a.acknowledged).length})</option>
                  <option value="active">Active ({alerts.filter(a => new Date() < a.expiryTime).length})</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={acknowledgeAll} size="sm" variant="outline" className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Acknowledge All
                </Button>
                <Button onClick={configurePreferences} size="sm" variant="outline" className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
                <Button onClick={exportAlerts} size="sm" variant="outline" className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={fetchAlerts} size="sm" variant="outline" className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Alerts Grid */}
        {filteredAlerts.length === 0 ? (
          <Card className="p-12 text-center bg-gray-900 border-gray-700">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900 mb-4">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {filter === 'all' ? 'All Clear - No Maritime Alerts' : `No ${filter} alerts found`}
            </h3>
            <p className="text-gray-400 mb-4">
              Maritime operations can proceed under normal safety protocols.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAlerts.map((alert) => {
              const IconComponent = alert.icon;
              const isExpired = new Date() > alert.expiryTime;
              
              return (
                <Card key={alert.id} className={`${getSeverityBorder(alert.severity)} border-l-4 ${getShakeAnimation(alert.severity)} ${isExpired ? 'opacity-60' : ''} bg-gray-900 border-gray-700`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6 text-gray-400" />
                        <div>
                          <CardTitle className="text-lg font-semibold text-white">
                            {alert.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getSeverityColor(alert.severity)} className="text-white">
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge className={`text-xs ${getRiskColor(alert.riskLevel)}`}>
                              {alert.riskLevel}
                            </Badge>
                            {alert.priority <= 2 && (
                              <Badge variant="outline" className="text-xs border-red-500 text-red-400">
                                PRIORITY {alert.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.acknowledged && (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        )}
                        {isExpired && (
                          <Archive className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {alert.description}
                    </p>

                    {/* Enhanced Location & Time */}
                    <div className="space-y-2 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>Issued {alert.timeIssued} • Expires {alert.expiryTime.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span>Source: {alert.source}</span>
                      </div>
                    </div>

                    {/* Enhanced Alert Metrics */}
                    <div className="grid grid-cols-3 gap-3 py-3 bg-gray-800 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{alert.windSpeed}</div>
                        <div className="text-xs text-gray-400">Wind</div>
                        <div className="text-xs text-gray-500">knots</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{alert.waveHeight}</div>
                        <div className="text-xs text-gray-400">Waves</div>
                        <div className="text-xs text-gray-500">meters</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-400">{alert.affectedVessels}</div>
                        <div className="text-xs text-gray-400">Vessels</div>
                        <div className="text-xs text-gray-500">affected</div>
                      </div>
                    </div>

                    {/* Enhanced Impact & Duration */}
                    <div className="text-sm">
                      <div className="text-gray-300 mb-1">
                        <span className="font-medium">Impact:</span> {alert.impact}
                      </div>
                      <div className="text-gray-300">
                        <span className="font-medium">Duration:</span> {alert.duration}
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-700">
                      <Button
                        onClick={() => viewDetails(alert)}
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      {!alert.acknowledged && (
                        <Button
                          onClick={() => acknowledge(alert.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        onClick={() => dismissAlert(alert.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Alert Details Modal */}
        {showModal && selectedAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                  <h2 className="text-2xl font-bold text-white">Maritime Alert Details</h2>
                </div>
                <Button
                  onClick={closeModal}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Alert Header */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{selectedAlert.title}</h3>
                  <div className="flex items-center gap-3">
                    <Badge variant={getSeverityColor(selectedAlert.severity)} className="text-white">
                      {selectedAlert.severity.toUpperCase()}
                    </Badge>
                    <Badge className={`text-xs ${getRiskColor(selectedAlert.riskLevel)}`}>
                      {selectedAlert.riskLevel}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                      ALERT ID: {selectedAlert.id}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
                      PRIORITY {selectedAlert.priority}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-300 leading-relaxed">{selectedAlert.description}</p>
                </div>

                {/* Location Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      Location Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-300">
                        <span className="font-medium text-white">Position:</span> {selectedAlert.location}
                      </div>
                      {selectedAlert.coordinates && (
                        <div className="text-gray-300">
                          <span className="font-medium text-white">Coordinates:</span> {selectedAlert.coordinates.lat}°N, {Math.abs(selectedAlert.coordinates.lon)}°{selectedAlert.coordinates.lon < 0 ? 'W' : 'E'}
                        </div>
                      )}
                      <div className="text-gray-300">
                        <span className="font-medium text-white">Source:</span> {selectedAlert.source}
                      </div>
                    </div>
                  </div>

                  {/* Timing Information */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-400" />
                      Timing Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-300">
                        <span className="font-medium text-white">Issued:</span> {formatTime(selectedAlert.issueTime)}
                      </div>
                      <div className="text-gray-300">
                        <span className="font-medium text-white">Duration:</span> {selectedAlert.duration}
                      </div>
                      <div className="text-gray-300">
                        <span className="font-medium text-white">Expires:</span> {formatTime(selectedAlert.expiryTime)}
                      </div>
                      <div className="text-gray-300">
                        <span className="font-medium text-white">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedAlert.acknowledged ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                          {selectedAlert.acknowledged ? 'ACKNOWLEDGED' : 'REQUIRES ATTENTION'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Maritime Conditions */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Waves className="h-5 w-5 text-cyan-400" />
                    Maritime Conditions
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{selectedAlert.windSpeed}</div>
                      <div className="text-xs text-gray-400">Wind Speed</div>
                      <div className="text-xs text-gray-500">knots</div>
                      {selectedAlert.windGusts && (
                        <div className="text-xs text-orange-400">Gusts: {selectedAlert.windGusts} knots</div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{selectedAlert.waveHeight}</div>
                      <div className="text-xs text-gray-400">Wave Height</div>
                      <div className="text-xs text-gray-500">meters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{selectedAlert.affectedVessels}</div>
                      <div className="text-xs text-gray-400">Vessels</div>
                      <div className="text-xs text-gray-500">affected</div>
                    </div>
                    {selectedAlert.barometricPressure && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{selectedAlert.barometricPressure}</div>
                        <div className="text-xs text-gray-400">Pressure</div>
                        <div className="text-xs text-gray-500">hPa</div>
                      </div>
                    )}
                    {selectedAlert.visibility !== undefined && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{selectedAlert.visibility}</div>
                        <div className="text-xs text-gray-400">Visibility</div>
                        <div className="text-xs text-gray-500">nm</div>
                      </div>
                    )}
                    {selectedAlert.currentSpeed && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-400">{selectedAlert.currentSpeed}</div>
                        <div className="text-xs text-gray-400">Current Speed</div>
                        <div className="text-xs text-gray-500">knots</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Impact Assessment */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Impact Assessment</h4>
                  <p className="text-gray-300">{selectedAlert.impact}</p>
                </div>

                {/* Safety Recommendations */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Safety Recommendations</h4>
                  <ul className="space-y-2">
                    {selectedAlert.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-400 font-semibold">{index + 1}.</span>
                        <span className="text-gray-300">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Emergency Contact */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-red-400 mb-2">Emergency Contact</h4>
                  <p className="text-gray-300">
                    For immediate assistance or to report emergencies, contact Coast Guard on 
                    <span className="font-bold text-white"> VHF Channel 16</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    Last Updated: {formatTime(new Date())}
                  </div>
                  <div className="flex gap-3">
                    {!selectedAlert.acknowledged && (
                      <Button
                        onClick={() => {
                          acknowledge(selectedAlert.id);
                          closeModal();
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Acknowledge Alert
                      </Button>
                    )}
                    <Button
                      onClick={closeModal}
                      variant="outline"
                      className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
