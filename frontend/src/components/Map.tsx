import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ChatIcon from "@material-ui/icons/Chat";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const useStyles = makeStyles({
    root: {
        height: "93.4vh",
        backgroundColor: "#cfe8fc",
    },
    item: {
        height: "100px",
        background: "#f0f8ff",
        position: "fixed",
        bottom: "0",
        width: "100%",
    },
});

const containerStyle = {
    width: "100%",
    height: "100%",
};

const positionAkiba = {
    lat: 35.69731,
    lng: 139.7747,
};
const center = {
    lat: 35.69731,
    lng: 139.7747,
};

const Map: React.FC = () => {
    const classes = useStyles();
    const [value, setValue] = useState(0);
    return (
        <div className={classes.root}>
            <LoadScript googleMapsApiKey="AIzaSyAS8lqTPsqxrmd9MqwDTsdybceRZ7yLbrM">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={17}
                >
                    <Marker position={positionAkiba} />
                </GoogleMap>
            </LoadScript>
            <BottomNavigation
                value={value}
                onChange={(event, newValue) => {
                    setValue(newValue);
                }}
                showLabels
                className={classes.item}
            >
                <BottomNavigationAction label="Chat" icon={<ChatIcon />} />
                <BottomNavigationAction
                    label="Favorites"
                    icon={<FavoriteIcon />}
                />
                <BottomNavigationAction
                    label="People"
                    icon={<PeopleAltIcon />}
                />
            </BottomNavigation>
        </div>
    );
};

export default Map;