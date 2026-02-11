import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import io from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw, Navigation, TrendingUp } from 'lucide-react';

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom truck icon (optional, using default for now or we can create a custom divIcon)
// const truckIcon = new L.Icon({
//   iconUrl: 'path/to/truck.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
// });

interface Location {
    lat: number;
    lng: number;
    lastUpdated: string;
}

interface DriverLocation {
    driverId: string;
    name?: string;
    location: Location;
    route?: any[];
    routeMetrics?: {
        totalDistance: number;
        estimatedTime: number;
        efficiency?: number;
    };
}

interface DriverRoute {
    driver: {
        id: string;
        name: string;
        truckNo: string;
        currentLocation?: Location;
        isOnline: boolean;
    };
    route: any[];
    totalDistance: number;
    estimatedTime: number;
    deliveryCount: number;
}

const LiveTracking: React.FC = () => {
    const [drivers, setDrivers] = useState<Record<string, DriverLocation>>({});
    const [driverRoutes, setDriverRoutes] = useState<DriverRoute[]>([]);
    const [, setSocket] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Connect to socket
        const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('✅ Admin dashboard connected to socket');
            newSocket.emit('join', { type: 'admin' });
        });

        newSocket.on('driver:location_update', (data: any) => {
            console.log('📍 Driver location update:', data);
            setDrivers(prev => ({
                ...prev,
                [data.driverId]: {
                    driverId: data.driverId,
                    location: data.location,
                }
            }));
        });

        // Listen for route optimization updates
        newSocket.on('route:optimized', (data: any) => {
            console.log('🗺️ Route optimized for driver:', data.driverId);
            loadAllRoutes();
        });

        newSocket.on('route:recalculated', (data: any) => {
            console.log('🔄 Route recalculated for driver:', data.driverId);
            loadAllRoutes();
        });

        // Load all routes initially
        loadAllRoutes();

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Load all driver routes
    const loadAllRoutes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/routes/all`);
            const data = await response.json();

            if (data.success) {
                setDriverRoutes(data.routes || []);

                // Update drivers state with route info
                const updatedDrivers: Record<string, DriverLocation> = {};
                data.routes.forEach((route: DriverRoute) => {
                    updatedDrivers[route.driver.id] = {
                        driverId: route.driver.id,
                        name: route.driver.name,
                        location: route.driver.currentLocation || { lat: 0, lng: 0, lastUpdated: '' },
                        route: route.route,
                        routeMetrics: {
                            totalDistance: route.totalDistance,
                            estimatedTime: route.estimatedTime,
                            efficiency: 0
                        }
                    };
                });
                setDrivers(prev => ({ ...prev, ...updatedDrivers }));
            }
        } catch (error) {
            console.error('Error loading routes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Recalculate all routes
    const recalculateAllRoutes = async () => {
        setLoading(true);
        try {
            const promises = driverRoutes.map(route =>
                fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/routes/recalculate/${route.driver.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: 'Admin requested recalculation' })
                })
            );

            await Promise.all(promises);
            await loadAllRoutes();
            alert('All routes recalculated successfully!');
        } catch (error) {
            console.error('Error recalculating routes:', error);
            alert('Failed to recalculate routes');
        } finally {
            setLoading(false);
        }
    };

    // Center map on Riyadh or a default location
    const center: [number, number] = [24.7136, 46.6753];

    // Generate unique color for each driver
    const getDriverColor = (index: number) => {
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
        return colors[index % colors.length];
    };

    return (
        <div className="h-[600px] w-full bg-gray-100 rounded-lg overflow-hidden shadow-lg border border-gray-200">
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Live Driver Tracking & Routes</h2>
                        <div className="text-sm text-gray-500 mt-1">
                            Active Drivers: <span className="font-bold text-green-600">{driverRoutes.length}</span>
                            {' '} | Total Deliveries: <span className="font-bold text-blue-600">
                                {driverRoutes.reduce((sum, r) => sum + r.deliveryCount, 0)}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadAllRoutes}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={recalculateAllRoutes}
                            disabled={loading || driverRoutes.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            <Navigation className="h-4 w-4" />
                            Recalculate All
                        </button>
                    </div>
                </div>

                {/* Route Metrics Summary */}
                {driverRoutes.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-xs text-blue-600 font-medium">Total Distance</div>
                            <div className="text-lg font-bold text-blue-900">
                                {driverRoutes.reduce((sum, r) => sum + r.totalDistance, 0).toFixed(1)} km
                            </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-xs text-green-600 font-medium">Est. Total Time</div>
                            <div className="text-lg font-bold text-green-900">
                                {Math.round(driverRoutes.reduce((sum, r) => sum + r.estimatedTime, 0) / 60)} hrs
                            </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-xs text-purple-600 font-medium">Avg Efficiency</div>
                            <div className="text-lg font-bold text-purple-900">
                                <TrendingUp className="inline h-4 w-4 mr-1" />
                                Optimized
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <MapContainer
                center={center}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render routes as polylines */}
                {driverRoutes.map((driverRoute, index) => {
                    if (!driverRoute.route || driverRoute.route.length < 2) return null;

                    const routeCoords: [number, number][] = driverRoute.route
                        .filter(d => d.coordinates)
                        .map(d => [d.coordinates.lat, d.coordinates.lng]);

                    if (routeCoords.length < 2) return null;

                    const color = getDriverColor(index);

                    return (
                        <Polyline
                            key={`route-${driverRoute.driver.id}`}
                            positions={routeCoords}
                            color={color}
                            weight={3}
                            opacity={0.7}
                            dashArray="5, 10"
                        />
                    );
                })}

                {Object.values(drivers).map((driver) => (
                    <Marker
                        key={driver.driverId}
                        position={[driver.location.lat, driver.location.lng]}
                    >
                        <Popup>
                            <div className="text-sm">
                                <p className="font-bold">Driver ID: {driver.driverId}</p>
                                <p>Lat: {driver.location.lat.toFixed(4)}</p>
                                <p>Lng: {driver.location.lng.toFixed(4)}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Updated: {new Date().toLocaleTimeString()}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default LiveTracking;
