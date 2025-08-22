import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Wind, Waves, Cloud, Navigation, Clock, MapPin, Bell, Filter, CheckCircle, X, RefreshCw, Settings } from 'lucide-react';

// Enhanced Alerts component with fully functional buttons
const Alerts = () => {
  const navigate = useNavigate(); // Add navigation hook
  
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState(true);
  const [preferences, setPreferences] = useState({
    high: true,
    medium: true,
    low: false
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Enhanced alert data with more details
      const alertsData = [
        {
          id: 1,
          severity: 'high',
          type: 'storm',
          title: 'Tropical Storm Warning',
          description: 'Tropical Storm Alex approaching with winds up to 45 knots and wave heights of 5-7 meters',
          location: 'North Atlantic - Zone 7 (35°N, 45°W)',
          coordinates: { lat: 35, lng: -45 }, // Added coordinates for map navigation
          timeIssued: '2 hours ago',
          duration: 'Next 18 hours',
          impact: 'High risk to vessel operations',
          icon: Cloud,
          acknowledged: false,
          recommendations: [
            'Reduce speed to 8-10 knots',
            'Consider alternative routing',
            'Secure all loose equipment'
          ],
          affectedVessels: 15,
          windSpeed: 45,
          waveHeight: 6.5
        },
        {
          id: 2,
          severity: 'medium',
          type: 'waves',
          title: 'High Wave Advisory',
          description: 'Significant wave heights of 3.5-4.5 meters expected due to strong westerly winds',
          location: 'Gulf of Mexico - Zone 3 (28°N, 90°W)',
          coordinates: { lat: 28, lng: -90 },
          timeIssued: '4 hours ago',
          duration: 'Next 12 hours',
          impact: 'Moderate impact on vessel stability',
          icon: Waves,
          acknowledged: false,
          recommendations: [
            'Monitor vessel stability',
            'Reduce speed if necessary',
            'Ensure proper ballast distribution'
          ],
          affectedVessels: 8,
          windSpeed: 28,
          waveHeight: 4.2
        },
        {
          id: 3,
          severity: 'medium',
          type: 'wind',
          title: 'Strong Wind Warning',
          description: 'Sustained winds of 25-30 knots with gusts up to 35 knots from the northwest',
          location: 'Mediterranean Sea - Zone 12 (40°N, 8°E)',
          coordinates: { lat: 40, lng: 8 },
          timeIssued: '6 hours ago',
          duration: 'Next 8 hours',
          impact: 'Increased fuel consumption expected',
          icon: Wind,
          acknowledged: true,
          recommendations: [
            'Adjust course to minimize wind resistance',
            'Monitor fuel consumption',
            'Prepare for rough conditions'
          ],
          affectedVessels: 12,
          windSpeed: 32,
          waveHeight: 2.8
        },
        {
          id: 4,
          severity: 'low',
          type: 'current',
          title: 'Strong Current Notice',
          description: 'Ocean current speeds of 1.8-2.2 knots detected, stronger than usual seasonal patterns',
          location: 'Caribbean Sea - Zone 8 (18°N, 75°W)',
          coordinates: { lat: 18, lng: -75 },
          timeIssued: '8 hours ago',
          duration: 'Next 24 hours',
          impact: 'Minor impact on ETA calculations',
          icon: Navigation,
          acknowledged: false,
          recommendations: [
            'Update navigation calculations',
            'Consider current assistance',
            'Monitor position regularly'
          ],
          affectedVessels: 5,
          windSpeed: 15,
          waveHeight: 1.2
        },
        {
          id: 5,
          severity: 'high',
          type: 'storm',
          title: 'Cyclone Watch',
          description: 'Tropical cyclone development possible in the next 48 hours. Currently Category 1 potential',
          location: 'Indian Ocean - Zone 15 (15°S, 75°E)',
          coordinates: { lat: -15, lng: 75 },
          timeIssued: '1 hour ago',
          duration: 'Next 48 hours',
          impact: 'Potential severe disruption to operations',
          icon: AlertTriangle,
          acknowledged: false,
          recommendations: [
            'Monitor development closely',
            'Prepare contingency plans',
            'Consider postponing departure'
          ],
          affectedVessels: 23,
          windSpeed: 40,
          waveHeight: 5.8
        }
      ];
      
      setAlerts(alertsData);
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
      case 'high': return 'border-l-destructive';
      case 'medium': return 'border-l-warning';
      case 'low': return 'border-l-secondary';
      default: return 'border-l-secondary';
    }
  };

  const getShakeAnimation = (severity) => {
    return severity === 'high' ? 'animate-pulse' : '';
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unacknowledged') return !alert.acknowledged;
    return alert.severity === filter;
  });

  // Enhanced button handlers
  const viewDetails = async (id) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;

    const details = `📋 ALERT DETAILS

🚨 ${alert.title}
📍 Location: ${alert.location}
⏰ Issued: ${alert.timeIssued}
🕒 Duration: ${alert.duration}
📊 Impact: ${alert.impact}

🌪️ Conditions:
• Wind Speed: ${alert.windSpeed} knots
• Wave Height: ${alert.waveHeight}m
• Affected Vessels: ${alert.affectedVessels}

💡 Recommendations:
${alert.recommendations.map(r => `• ${r}`).join('\n')}

Status: ${alert.acknowledged ? '✅ Acknowledged' : '⚠️ Requires Attention'}`;

    window.alert(details);
  };

  // Navigate to map page with alert location
  const viewOnMap = (id) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;

    // Navigate to map with query parameters for the alert location
    const queryParams = new URLSearchParams({
      lat: alert.coordinates.lat.toString(),
      lng: alert.coordinates.lng.toString(),
      alertId: id.toString(),
      alertType: alert.type
    });

    navigate(`/map?${queryParams.toString()}`);
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
        window.alert(`✅ Alert ${id} acknowledged successfully`);
      }
    } catch (err) {
      window.alert("❌ Failed to acknowledge alert");
    }
  };

  const acknowledgeAll = async () => {
    const unacknowledgedIds = alerts.filter(a => !a.acknowledged).map(a => a.id);
    
    try {
      const response = await fetch("http://localhost:5000/api/alerts/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unacknowledgedIds }),
      });
      
      if (response.ok) {
        setAlerts(alerts.map(alert => ({ ...alert, acknowledged: true })));
        window.alert(`✅ All ${unacknowledgedIds.length} alerts acknowledged`);
      }
    } catch (err) {
      window.alert("❌ Failed to acknowledge all alerts");
    }
  };

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    window.alert(`🗑️ Alert ${id} dismissed`);
  };

  const configurePreferences = async () => {
    const newPrefs = {
      ...preferences,
      high: confirm("📢 Receive HIGH severity alerts?"),
      medium: confirm("📢 Receive MEDIUM severity alerts?"),
      low: confirm("📢 Receive LOW severity alerts?")
    };
    
    setPreferences(newPrefs);
    
    try {
      const response = await fetch("http://localhost:5000/api/alerts/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrefs),
      });
      
      if (response.ok) {
        window.alert(`⚙️ Alert preferences updated:\n• High: ${newPrefs.high ? 'ON' : 'OFF'}\n• Medium: ${newPrefs.medium ? 'ON' : 'OFF'}\n• Low: ${newPrefs.low ? 'ON' : 'OFF'}`);
      }
    } catch (err) {
      window.alert("❌ Failed to update preferences");
    }
  };

  const exportAlerts = () => {
    const alertsCSV = [
      'ID,Title,Severity,Location,Time Issued,Duration,Impact,Acknowledged',
      ...filteredAlerts.map(alert => 
        `${alert.id},"${alert.title}",${alert.severity},"${alert.location}",${alert.timeIssued},${alert.duration},"${alert.impact}",${alert.acknowledged}`
      )
    ].join('\n');
    
    const blob = new Blob([alertsCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maritime-alerts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading alerts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center text-2xl">
                <AlertTriangle className="mr-2 h-6 w-6" />
                Maritime Weather Alerts
                {notifications && <Bell className="ml-2 h-5 w-5 text-blue-500" />}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Active weather warnings and maritime safety notifications
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={fetchAlerts} variant="outline" size="sm">
                <RefreshCw className="mr-1 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={acknowledgeAll} size="sm">
                <CheckCircle className="mr-1 h-4 w-4" />
                Acknowledge All
              </Button>
              <Button onClick={exportAlerts} variant="outline" size="sm">
                📊 Export
              </Button>
              <Button onClick={configurePreferences} variant="outline" size="sm">
                <Settings className="mr-1 h-4 w-4" />
                Preferences
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filter:</span>
            </div>
            
            {['all', 'high', 'medium', 'low', 'unacknowledged'].map((filterOption) => (
              <Button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                variant={filter === filterOption ? 'default' : 'outline'}
                size="sm"
                className="capitalize"
              >
                {filterOption}
                {filterOption !== 'all' && filterOption !== 'unacknowledged' && (
                  <Badge variant="secondary" className="ml-2">
                    {alerts.filter(a => a.severity === filterOption).length}
                  </Badge>
                )}
                {filterOption === 'unacknowledged' && (
                  <Badge variant="secondary" className="ml-2">
                    {alerts.filter(a => !a.acknowledged).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">No Active Alerts</h3>
              <p className="text-muted-foreground">
                {filter === 'all' ? 'All clear! No weather alerts at this time.' : `No ${filter} alerts found.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <Card 
                key={alert.id} 
                className={`${getSeverityBorder(alert.severity)} border-l-4 ${getShakeAnimation(alert.severity)} ${alert.acknowledged ? 'opacity-75' : ''}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <Icon className="h-6 w-6 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {alert.location}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => dismissAlert(alert.id)}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm">{alert.description}</p>
                  
                  {/* Alert Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted rounded-lg text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Wind Speed</p>
                      <p className="font-bold">{alert.windSpeed} knots</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Wave Height</p>
                      <p className="font-bold">{alert.waveHeight}m</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Vessels Affected</p>
                      <p className="font-bold">{alert.affectedVessels}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Duration</p>
                      <p className="font-bold">{alert.duration}</p>
                    </div>
                  </div>
                  
                  {/* Impact Assessment */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Impact Assessment
                    </h4>
                    <p className="text-sm text-blue-800">{alert.impact}</p>
                  </div>
                  
                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Recommended Actions:</h4>
                    <ul className="text-sm space-y-1">
                      {alert.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    <Button 
                      onClick={() => viewDetails(alert.id)} 
                      variant="outline" 
                      size="sm"
                    >
                      📋 View Details
                    </Button>
                    
                    {!alert.acknowledged && (
                      <Button 
                        onClick={() => acknowledge(alert.id)} 
                        size="sm"
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Acknowledge
                      </Button>
                    )}
                    
                    <Button 
                      onClick={() => viewOnMap(alert.id)}
                      variant="outline" 
                      size="sm"
                    >
                      🗺️ View on Map
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      📊 Historical Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Alerts;
