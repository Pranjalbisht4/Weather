import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Wind, Waves, Thermometer, Cloud, Calendar, Download, RefreshCw, AlertTriangle, Eye, Ship } from 'lucide-react';

type DayForecast = {
  day: string;
  date: string;          // ISO date
  wind: number;          // knots
  waves: number;         // meters
  temp: number;          // °C
  condition: string;
  description: string;
  humidity: number;
  pressure: number;
  visibility: string;    // km (string)
  clouds: number;
  icon: string;
  windDirection: number;
  source?: string;
  recommendationLevel?: 'optimal' | 'caution' | 'high-risk';
};

const Forecast = () => {
  const [forecastData, setForecastData] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('London');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForecastData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation]);

  const getRiskLevel = (wind: number, waves: number): 'optimal' | 'caution' | 'high-risk' => {
    if (wind > 25 || waves > 3.5) return 'high-risk';
    if (wind > 20 || waves > 2.5) return 'caution';
    return 'optimal';
  };

  const fetchForecastData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`http://localhost:5000/api/forecast10?city=${encodeURIComponent(selectedLocation)}`);
      const data = await res.json();

      if (res.ok && data && Array.isArray(data.days)) {
        // Map backend keys to UI (and ensure exactly 10)
        const days = (data.days as DayForecast[]).slice(0, 10).map((d, idx) => ({
          ...d,
          // ensure labels are present in case backend changed
          day: d.day || (idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : `Day ${idx + 1}`),
          recommendationLevel: getRiskLevel(d.wind, d.waves),
        }));
        setForecastData(days);
      } else {
        setError('Backend returned no forecast data');
        setForecastData(generateSampleForecast());
      }
    } catch (err) {
      console.error('Forecast fetch error:', err);
      setError('Failed to fetch forecast data');
      setForecastData(generateSampleForecast());
    } finally {
      setLoading(false);
    }
  };

  const generateSampleForecast = (): DayForecast[] => {
    // Always 10 items fallback
    const base = [
      { day: 'Today',     date: new Date().toISOString().slice(0,10), wind: 15, waves: 2.1, temp: 24, condition: 'Partly Cloudy', description: 'Partly cloudy', humidity: 65, pressure: 1013, visibility: '10.0', clouds: 40, icon: '02d', windDirection: 120 },
      { day: 'Tomorrow',  date: new Date(Date.now() + 86400000).toISOString().slice(0,10), wind: 18, waves: 2.8, temp: 22, condition: 'Cloudy',        description: 'Overcast clouds', humidity: 70, pressure: 1010, visibility: '8.5', clouds: 80, icon: '04d', windDirection: 160 },
      { day: 'Day 3',     date: new Date(Date.now() + 2*86400000).toISOString().slice(0,10), wind: 12, waves: 1.9, temp: 26, condition: 'Sunny',         description: 'Clear sky',      humidity: 55, pressure: 1015, visibility: '10.0', clouds: 10, icon: '01d', windDirection: 90  },
      { day: 'Day 4',     date: new Date(Date.now() + 3*86400000).toISOString().slice(0,10), wind: 22, waves: 3.2, temp: 21, condition: 'Windy',         description: 'Strong winds',   humidity: 75, pressure: 1005, visibility: '7.0', clouds: 60, icon: '50d', windDirection: 200 },
      { day: 'Day 5',     date: new Date(Date.now() + 4*86400000).toISOString().slice(0,10), wind: 28, waves: 4.1, temp: 19, condition: 'Stormy',        description: 'Thunderstorm',   humidity: 85, pressure: 995,  visibility: '5.0', clouds: 90, icon: '11d', windDirection: 220 },
      { day: 'Day 6',     date: new Date(Date.now() + 5*86400000).toISOString().slice(0,10), wind: 16, waves: 2.5, temp: 23, condition: 'Partly Cloudy', description: 'Few clouds',     humidity: 60, pressure: 1012, visibility: '9.0', clouds: 30, icon: '02d', windDirection: 60  },
      { day: 'Day 7',     date: new Date(Date.now() + 6*86400000).toISOString().slice(0,10), wind: 14, waves: 2.0, temp: 25, condition: 'Sunny',         description: 'Clear sky',      humidity: 50, pressure: 1018, visibility: '10.0',clouds: 5,  icon: '01d', windDirection: 45  },
      { day: 'Day 8',     date: new Date(Date.now() + 7*86400000).toISOString().slice(0,10), wind: 20, waves: 3.0, temp: 22, condition: 'Cloudy',        description: 'Broken clouds',  humidity: 68, pressure: 1008, visibility: '8.0', clouds: 70, icon: '04d', windDirection: 180 },
      { day: 'Day 9',     date: new Date(Date.now() + 8*86400000).toISOString().slice(0,10), wind: 17, waves: 2.6, temp: 24, condition: 'Partly Cloudy', description: 'Scattered clouds',humidity: 62, pressure: 1014, visibility: '9.5', clouds: 35, icon: '03d', windDirection: 140 },
      { day: 'Day 10',    date: new Date(Date.now() + 9*86400000).toISOString().slice(0,10), wind: 13, waves: 1.8, temp: 26, condition: 'Sunny',         description: 'Clear sky',      humidity: 48, pressure: 1020, visibility: '10.0',clouds: 8,  icon: '01d', windDirection: 10  },
    ] as DayForecast[];
    return base.map(d => ({ ...d, recommendationLevel: getRiskLevel(d.wind, d.waves) }));
  };

  const getWindColor = (speed: number) => {
    if (speed < 15) return 'text-success';
    if (speed < 25) return 'text-warning';
    return 'text-destructive';
  };

  const getWaveColor = (height: number) => {
    if (height < 2) return 'text-success';
    if (height < 3.5) return 'text-warning';
    return 'text-destructive';
  };

  const getRecommendationColor = (level?: string) => {
    switch (level) {
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'caution': return 'bg-yellow-100 text-yellow-800';
      case 'high-risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationText = (day: DayForecast) => {
    if (day.wind < 15 && day.waves < 2) return 'Optimal conditions';
    if (day.wind < 25 && day.waves < 3.5) return 'Proceed with caution';
    return 'High risk - Consider delay';
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  const handleDownloadForecast = () => {
    const csvContent = [
      'Day,Date,Condition,Wind Speed (knots),Wave Height (m),Temperature (°C),Humidity (%),Pressure (hPa),Visibility (km),Recommendation',
      ...forecastData.map(day =>
        `${day.day},${day.date},${day.condition},${day.wind},${day.waves},${day.temp},${day.humidity},${day.pressure},${day.visibility},"${getRecommendationText(day)}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maritime-forecast-${selectedLocation}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateRoute = () => {
    const optimalDays = forecastData.filter(day => day.recommendationLevel === 'optimal');
    alert(`🚢 Route Planning Analysis:\n\n${optimalDays.length} out of 10 days have optimal conditions.\n\nBest sailing windows:\n${optimalDays.slice(0, 3).map(day => `• ${day.day}: ${day.wind} knots, ${day.waves}m waves`).join('\n')}\n\nRecommendation: ${optimalDays.length > 6 ? 'Excellent forecast for voyage' : optimalDays.length > 3 ? 'Good conditions with some weather windows' : 'Consider delaying or alternative routing'}`);
  };

  const handleViewDetails = (day: DayForecast) => {
    alert(`📊 Detailed Forecast - ${day.day}\n\n🌡️ Temperature: ${day.temp}°C\n💨 Wind: ${day.wind} knots\n🌊 Waves: ${day.waves}m\n☁️ Condition: ${day.condition}\n💧 Humidity: ${day.humidity}%\n🌡️ Pressure: ${day.pressure} hPa\n👁️ Visibility: ${day.visibility}km\n☁️ Cloud Cover: ${day.clouds}%\n\n📋 Maritime Recommendation:\n${getRecommendationText(day)}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin mr-3" />
        <span>Loading forecast data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center text-2xl">
                <Calendar className="mr-2 h-6 w-6" />
                10-Day Maritime Forecast
              </CardTitle>
              <p className="text-muted-foreground">
                Detailed weather predictions for optimal voyage planning
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
  value={selectedLocation}
  onChange={(e) => handleLocationChange(e.target.value)}
  className="
    px-3 py-2 rounded-md text-sm font-medium
    bg-blue-50 text-blue-800 border border-blue-300
    hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500
  "
>
  <option value="London">London, UK</option>
  <option value="New York">New York, USA</option>
  <option value="Singapore">Singapore</option>
  <option value="Hamburg">Hamburg, Germany</option>
  <option value="Rotterdam">Rotterdam, Netherlands</option>
</select>


              <Button onClick={fetchForecastData} variant="outline" size="sm">
                <RefreshCw className="mr-1 h-4 w-4" />
                Refresh
              </Button>

              <Button onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')} variant="outline" size="sm">
                {viewMode === 'cards' ? '📊 Table View' : '📱 Card View'}
              </Button>

              <Button onClick={handleDownloadForecast} variant="outline" size="sm">
                <Download className="mr-1 h-4 w-4" />
                Export CSV
              </Button>

              <Button onClick={handleGenerateRoute} size="sm">
                <Ship className="mr-1 h-4 w-4" />
                Plan Route
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center text-destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {error} - Showing sample data
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Optimal Days',
            value: forecastData.filter(d => d.recommendationLevel === 'optimal').length,
            icon: TrendingUp,
            color: 'text-green-600'
          },
          {
            label: 'Caution Days',
            value: forecastData.filter(d => d.recommendationLevel === 'caution').length,
            icon: Eye,
            color: 'text-yellow-600'
          },
          {
            label: 'High Risk Days',
            value: forecastData.filter(d => d.recommendationLevel === 'high-risk').length,
            icon: AlertTriangle,
            color: 'text-red-600'
          },
          {
            label: 'Avg Wind Speed',
            value: `${Math.round(forecastData.reduce((sum, d) => sum + d.wind, 0) / Math.max(1, forecastData.length))} kts`,
            icon: Wind,
            color: 'text-blue-600'
          }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forecast Display */}
      {viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {forecastData.map((day, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(day)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{day.day}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getRecommendationColor(day.recommendationLevel)}>
                    {(day.recommendationLevel || '').replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold">{day.temp}°C</div>
                  <div className="text-sm text-muted-foreground">{day.condition}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm">
                      <Wind className="h-4 w-4 mr-1" />
                      Wind
                    </div>
                    <span className={`font-medium ${getWindColor(day.wind)}`}>
                      {day.wind} knots
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm">
                      <Waves className="h-4 w-4 mr-1" />
                      Waves
                    </div>
                    <span className={`font-medium ${getWaveColor(day.waves)}`}>
                      {day.waves}m
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Visibility
                    </div>
                    <span className="font-medium text-sm">
                      {day.visibility}km
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(day);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardHeader>
            <CardTitle>Detailed Forecast Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Day</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Condition</th>
                    <th className="text-left p-2">Wind Speed</th>
                    <th className="text-left p-2">Wave Height</th>
                    <th className="text-left p-2">Temperature</th>
                    <th className="text-left p-2">Visibility</th>
                    <th className="text-left p-2">Recommendation</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.map((day, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{day.day}</td>
                      <td className="p-2">{new Date(day.date).toLocaleDateString()}</td>
                      <td className="p-2">{day.condition}</td>
                      <td className={`p-2 font-medium ${getWindColor(day.wind)}`}>
                        {day.wind} knots
                      </td>
                      <td className={`p-2 font-medium ${getWaveColor(day.waves)}`}>
                        {day.waves}m
                      </td>
                      <td className="p-2">{day.temp}°C</td>
                      <td className="p-2">{day.visibility}km</td>
                      <td className="p-2">
                        <Badge className={getRecommendationColor(day.recommendationLevel)}>
                          {getRecommendationText(day)}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(day)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Forecast;
