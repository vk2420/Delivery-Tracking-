import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom numbered marker icon
const createNumberedIcon = (number: number, isCompleted: boolean = false) => {
    const color = isCompleted ? '#10b981' : '#3b82f6';
    const html = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${number}</div>
  `;

    return L.divIcon({
        html,
        className: 'custom-numbered-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
};

interface RouteMapProps {
    route: any[];
    currentLocation?: { lat: number; lng: number };
    onMarkerClick?: (delivery: any) => void;
}

// Component to auto-fit map bounds
const AutoFitBounds: React.FC<{ route: any[] }> = ({ route }) => {
    const map = useMap();

    useEffect(() => {
        if (route.length > 0) {
            const bounds = L.latLngBounds(
                route.map(d => [d.coordinates.lat, d.coordinates.lng])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [route, map]);

    return null;
};

const RouteMap: React.FC<RouteMapProps> = ({ route, currentLocation, onMarkerClick }) => {
    const center: [number, number] = route.length > 0
        ? [route[0].coordinates.lat, route[0].coordinates.lng]
        : [24.7136, 46.6753]; // Default to Riyadh

    // Create polyline coordinates
    const polylineCoords: [number, number][] = route.map(d => [
        d.coordinates.lat,
        d.coordinates.lng
    ]);

    return (
        <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <AutoFitBounds route={route} />

            {/* Route polyline */}
            {polylineCoords.length > 1 && (
                <Polyline
                    positions={polylineCoords}
                    color="#3b82f6"
                    weight={4}
                    opacity={0.7}
                    dashArray="10, 10"
                />
            )}

            {/* Delivery markers */}
            {route.map((delivery, index) => (
                <Marker
                    key={delivery._id || delivery.id}
                    position={[delivery.coordinates.lat, delivery.coordinates.lng]}
                    icon={createNumberedIcon(
                        delivery.sequence || index + 1,
                        delivery.status === 'Delivered'
                    )}
                    eventHandlers={{
                        click: () => onMarkerClick && onMarkerClick(delivery)
                    }}
                >
                    <Popup>
                        <div className="text-sm">
                            <p className="font-bold">Stop #{delivery.sequence || index + 1}</p>
                            <p className="font-semibold mt-1">{delivery.customerName}</p>
                            <p className="text-gray-600">{delivery.address}</p>
                            <p className="text-gray-600">{delivery.customerPhone}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Status: {delivery.status}
                            </p>
                            {delivery.distanceFromPrevious > 0 && (
                                <p className="text-xs text-blue-600 mt-1">
                                    {delivery.distanceFromPrevious.toFixed(1)} km from previous
                                </p>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Current location marker */}
            {currentLocation && (
                <Marker
                    position={[currentLocation.lat, currentLocation.lng]}
                    icon={L.divIcon({
                        html: `
              <div style="
                background-color: #ef4444;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
                animation: pulse 2s infinite;
              "></div>
            `,
                        className: 'current-location-marker',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    })}
                >
                    <Popup>
                        <div className="text-sm">
                            <p className="font-bold text-red-600">Your Current Location</p>
                        </div>
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default RouteMap;
