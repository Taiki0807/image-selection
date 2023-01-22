import React, { useState } from "react";
import { TileLayer, Marker, MapContainer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import Datos from "./Datos";

const Map = () => {
    const [item, setItem] = useState(Datos);

    const defaultCenter: any = [-12.069475, -77.022161];
    const defaultZoom = 5;
    return (
        <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            style={{
                height: "90%",
                width: "100%",
            }}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {item.map(({ lat, lng, IdUbigeo, img, Departamento }) => {
                return (
                    <Marker
                        key={IdUbigeo}
                        position={[lat, lng]}
                        icon={L.divIcon({
                            className: "custom-div-icon",
                            html: `
                            <div class='marker-pin'>
                            <img src=${img} />
                            </div>
                            `,
                            iconSize: [30, 42],
                            iconAnchor: [20, 50],
                        })}
                    ></Marker>
                );
            })}
        </MapContainer>
    );
};

export default Map;
