import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type MapProduct = {
  id: number;
  name: string;
  price: number;
  latitude?: number | null;
  longitude?: number | null;
};

type ProductsMapProps = {
  products: MapProduct[];
};

function ProductsMap({ products }: ProductsMapProps) {
  const pinned = products.filter(
    (p): p is MapProduct & { latitude: number; longitude: number } =>
      p.latitude != null && p.longitude != null
  );

  if (pinned.length === 0) {
    return <p>Brak produktów z ustawioną lokalizacją.</p>;
  }

  const avgLat =
    pinned.reduce((sum, p) => sum + p.latitude, 0) / pinned.length;
  const avgLng =
    pinned.reduce((sum, p) => sum + p.longitude, 0) / pinned.length;

  return (
    <MapContainer
      center={[avgLat, avgLng]}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {pinned.map((product) => (
        <Marker key={product.id} position={[product.latitude, product.longitude]}>
          <Popup>
            <strong>{product.name}</strong>
            <br />
            od {product.price} PLN
            <br />
            <Link to={`/listing-page/${product.id}`}>Zobacz szczegóły</Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default ProductsMap;