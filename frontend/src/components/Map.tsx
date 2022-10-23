import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

const containerStyle = {
    height: "100vh",
    width: "100%",
};

const center = {
    lat: 35.69575,
    lng: 139.77521,
};

const Map: React.FC = () => {
    return (
        <LoadScript googleMapsApiKey="API Key">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={17}
            ></GoogleMap>
        </LoadScript>
    );
};

export default Map;
