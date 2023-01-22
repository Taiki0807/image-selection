import React, { useState } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ChatIcon from "@material-ui/icons/Chat";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";
import MapItem from "./Map";
import { useNavigate } from "react-router";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import CommentIcon from "@material-ui/icons/Comment";
import { useAuthContext } from "../context/AuthContext";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const useStyles = makeStyles((theme) => ({
    root: {
        height: "93.4vh",
    },
    item: {
        height: "100px",
        background: "#f0f8ff",
        position: "fixed",
        bottom: "0",
        width: "100%",
    },
    typography: {
        padding: theme.spacing(2),
    },
    people: {
        height: "auto",
    },
}));

const Mappage: React.FC = () => {
    const history = useNavigate();
    const classes = useStyles();
    const [value, setValue] = useState(0);
    const router = useNavigate();
    const { user } = useAuthContext();
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
        null
    );
    const [matchinglist, setMatchinglist] = useState([]);
    var resultArray = new Array();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        handlematching();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;
    const getUserData = async (uid: string) => {
        try {
            const userDocumentRef = doc(db, "users", uid);
            const documentSnapshot = await getDoc(userDocumentRef);
            const userData = documentSnapshot.data();
            resultArray.push(userData);
            setMatchinglist(resultArray as any);
            return userData;
        } catch (error) {
            console.log("Error getting user data: ", error);
            return error;
        }
    };

    const handlematching = () => {
        fetch(`/api/matchinguser`, {
            method: "POST",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid: user?.uid,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data.message);
                data.message.forEach((uid: any) => {
                    console.log("uid", uid);
                    getUserData(uid);
                });
            });
        console.log(resultArray);
    };

    return (
        <div className={classes.root}>
            <MapItem />
            <BottomNavigation
                value={value}
                onChange={(event, newValue) => {
                    setValue(newValue);
                }}
                showLabels
                className={classes.item}
            >
                <BottomNavigationAction
                    label="Chat"
                    icon={<ChatIcon />}
                    onClick={() => {
                        router("/chat");
                    }}
                />
                <BottomNavigationAction
                    label="Favorites"
                    icon={<FavoriteIcon />}
                />
                <BottomNavigationAction
                    label="Matching"
                    icon={<PeopleAltIcon />}
                    onClick={handleClick}
                />
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "center",
                    }}
                    transformOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                    }}
                >
                    <Typography className={classes.typography}>
                        <List className={classes.people}>
                            {matchinglist.map((data: any, index: number) => {
                                return (
                                    <div key={index}>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar
                                                    alt="Remy Sharp"
                                                    src={data.photoURL}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={data.displayName}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    aria-label="comments"
                                                    onClick={() => {
                                                        axios
                                                            .post(
                                                                "https://api.chatengine.io/chats/",
                                                                {
                                                                    usernames: [
                                                                        data.displayName,
                                                                    ],
                                                                    title: "test",
                                                                    is_direct_chat:
                                                                        true,
                                                                },
                                                                {
                                                                    headers: {
                                                                        "project-id":
                                                                            "5aa81f11-edba-4f73-8e30-a2df07acecfb",
                                                                        "user-name":
                                                                            user?.displayName,
                                                                        "user-secret":
                                                                            user?.uid,
                                                                    },
                                                                }
                                                            )
                                                            .then(() => {
                                                                history(
                                                                    "/chat"
                                                                );
                                                            });
                                                    }}
                                                >
                                                    <CommentIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        <Divider
                                            variant="inset"
                                            component="li"
                                        />
                                    </div>
                                );
                            })}
                        </List>
                    </Typography>
                </Popover>
            </BottomNavigation>
        </div>
    );
};

export default Mappage;
