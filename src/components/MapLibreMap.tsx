import { LngLat, type MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RLayer, RMap, RSource, useMap } from 'maplibre-react-components';
import { getHoydeFromPunkt } from '../api/getHoydeFromPunkt';
import { useEffect, useState } from 'react';
import { Overlay } from './Overlay';
import DrawComponent from './DrawComponent';
import { SearchBar, type Address } from './SearchBar';
import { getBygningAtPunkt } from '../api/getBygningAtPunkt';
import type { GeoJSON } from 'geojson';

const UIO_COORDS: [number, number] = [10.71788676054797, 59.94334031458817];

export const MapLibreMap = () => {
  const [pointHoyde, setPointHoydeAtPunkt] = useState<number | undefined>(
    undefined
  );
  const [clickPoint, setClickPoint] = useState<LngLat | undefined>(undefined);
  const [address, setAddress] = useState<Address | null>(null);
  const [bygningsOmriss, setBygningsOmriss] = useState<GeoJSON | undefined>(
    undefined
  );
  const polygonStyle = {
    'fill-outline-color': 'rgba(255, 0, 255, 0.9)', // Neon magenta outline
    'fill-color': 'rgba(0, 255, 255, 0.6)', // Neon cyan fill
  };

  useEffect(() => {
    console.log(pointHoyde, clickPoint);
  }, [clickPoint, pointHoyde]);

  const onMapClick = async (e: MapLayerMouseEvent) => {
    const bygningResponse = await getBygningAtPunkt(e.lngLat.lng, e.lngLat.lat);
    if (bygningResponse?.FkbData?.BygningsOmriss) {
      const geoJsonObject = JSON.parse(bygningResponse.FkbData.BygningsOmriss);
      setBygningsOmriss(geoJsonObject);
    } else {
      setBygningsOmriss(undefined);
    }

    const hoyder = await getHoydeFromPunkt(e.lngLat.lng, e.lngLat.lat);
    setPointHoydeAtPunkt(hoyder[0].Z);
    setClickPoint(new LngLat(e.lngLat.lng, e.lngLat.lat));
  };

  return (
    <RMap
      minZoom={6}
      initialCenter={UIO_COORDS}
      initialZoom={15}
      mapStyle="https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json"
      style={{
        height: `calc(100dvh - var(--header-height))`,
      }}
      onClick={onMapClick}
    >
      {bygningsOmriss && (
        <>
          <RSource id="bygning" type="geojson" data={bygningsOmriss} />
          <RLayer
            source="bygning"
            id="bygning-fill"
            type="fill"
            paint={polygonStyle}
          />
        </>
      )}

      {address && (
        <MapFlyTo
          lngLat={
            new LngLat(address.PayLoad.Posisjon.X, address.PayLoad.Posisjon.Y)
          }
        />
      )}

      <Overlay>
        {pointHoyde !== undefined && <h2>Høyde: {pointHoyde.toFixed(1)}m</h2>}
        {clickPoint && (
          <p>
            Punkt: {clickPoint.lat.toFixed(5)} (lat),{' '}
            {clickPoint.lng.toFixed(5)} (lon)
          </p>
        )}
        <SearchBar setAddress={setAddress} />
      </Overlay>
      <DrawComponent />
    </RMap>
  );
};

function MapFlyTo({ lngLat }: { lngLat: LngLat }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 20, speed: 10 });
  }, [lngLat, map]);

  return null;
}
