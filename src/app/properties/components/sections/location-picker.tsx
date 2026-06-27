import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/** Sofia geographic center — fallback when a property has no coordinates. */
export const SOFIA_CENTER: readonly [number, number] = [42.6977, 23.3219];

const SETTLEMENT_ZOOM = 14;
const COUNTRY_ZOOM = 7;

const CARTO_TILES =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Inline SVG pin keeps us free of Leaflet's bundler-broken default marker asset.
const PIN_HTML = `
<svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 0C7.7 0 1 6.7 1 15c0 10.5 13.4 23.6 14 24.2.6.6 1.4.6 2 0 .6-.6 14-13.7 14-24.2C31 6.7 24.3 0 16 0z" fill="#0f172a"/>
  <circle cx="16" cy="15" r="6" fill="#fff"/>
</svg>`;

const pinIcon = L.divIcon({
  html: PIN_HTML,
  className: 'location-picker-pin',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
});

const round6 = (n: number): number => Math.round(n * 1e6) / 1e6;

interface LocationPickerProps {
  /** Current latitude bound to the form, or null when unset. */
  lat: number | null;
  /** Current longitude bound to the form, or null when unset. */
  lng: number | null;
  /**
   * When set (e.g. after the owner picks a settlement), the map pans here and
   * drops the pin. Pass a fresh object to trigger a recenter.
   */
  center?: { lat: number; lng: number } | null;
  /** Called with rounded coordinates whenever the pin moves. */
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

export function LocationPicker({
  lat,
  lng,
  center,
  onChange,
  className = '',
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Initialize the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const hasCoords = lat != null && lng != null;
    const start: [number, number] = hasCoords ? [lat, lng] : [...SOFIA_CENTER];

    const map = L.map(containerRef.current, {
      center: start,
      zoom: hasCoords ? SETTLEMENT_ZOOM : COUNTRY_ZOOM,
      scrollWheelZoom: true,
    });
    L.tileLayer(CARTO_TILES, {
      attribution: CARTO_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    const marker = L.marker(start, { icon: pinIcon, draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const { lat: mLat, lng: mLng } = marker.getLatLng();
      onChangeRef.current(round6(mLat), round6(mLng));
    });
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onChangeRef.current(round6(e.latlng.lat), round6(e.latlng.lng));
    });

    mapRef.current = map;
    markerRef.current = marker;

    // The form section may be hidden on mount; recompute size on next frame.
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Intentionally run once — subsequent prop changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter + drop pin when a settlement center is provided.
  useEffect(() => {
    if (!center || !mapRef.current || !markerRef.current) return;
    const pos: [number, number] = [center.lat, center.lng];
    mapRef.current.setView(pos, SETTLEMENT_ZOOM, { animate: true });
    markerRef.current.setLatLng(pos);
    onChangeRef.current(round6(center.lat), round6(center.lng));
  }, [center]);

  // Reflect external coordinate edits (manual lat/lng inputs) onto the pin.
  useEffect(() => {
    if (lat == null || lng == null || !markerRef.current) return;
    const current = markerRef.current.getLatLng();
    if (round6(current.lat) === round6(lat) && round6(current.lng) === round6(lng)) {
      return;
    }
    markerRef.current.setLatLng([lat, lng]);
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className={`h-64 w-full rounded-lg border z-0 ${className}`}
      role="application"
      aria-label="Карта за избор на местоположение"
    />
  );
}
