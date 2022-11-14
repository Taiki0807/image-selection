import React, { useEffect, useState } from "react";
import { Link as RouterLink, LinkProps } from "react-router-dom";
import {
    AppBar,
    Link,
    Toolbar,
    Typography,
    makeStyles,
    createStyles,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@material-ui/core";
import { useAuthContext } from "../context/AuthContext";
import { app } from "../firebase";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { IconContext } from "react-icons";
import { FiLogOut } from "react-icons/fi";
import MailIcon from "@material-ui/icons/Mail";
import Badge from "@material-ui/core/Badge";
import Avatar from "@material-ui/core/Avatar";
import { Theme, withStyles } from "@material-ui/core/styles";

import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        title: {
            flexGrow: 1,
        },
        logo: {
            marginLeft: "10px",
        },
        contents: {
            marginRight: "20px",
        },
        icon: {
            background: "#dcdcdc",
        },
        large: {
            width: theme.spacing(30),
            height: theme.spacing(30),
        },
    });
});
const StyledBadge = withStyles((theme: Theme) =>
    createStyles({
        badge: {
            backgroundColor: "#44b700",
            color: "#44b700",
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
            "&::after": {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                animation: "$ripple 1.2s infinite ease-in-out",
                border: "1px solid currentColor",
                content: '""',
            },
        },
        "@keyframes ripple": {
            "0%": {
                transform: "scale(.8)",
                opacity: 1,
            },
            "100%": {
                transform: "scale(2.4)",
                opacity: 0,
            },
        },
    })
)(Badge);

const Header: React.FC = () => {
    const classes = useStyles();
    const { user } = useAuthContext();
    const isLoggedIn = !(user == null);
    const auth = getAuth(app);
    const router = useNavigate();
    const [likeimage, setLikeimage] = useState("");

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const [dialogopen, setDialogopen] = React.useState(false);

    const handleClickOpen = () => {
        setDialogopen(true);
    };

    const dialogClose = () => {
        setDialogopen(false);
    };

    const onGeneratefaceOpen = async () => {
        handleClose();
        handleClickOpen();
        handleclallapi();
    };

    const onClickSignout = async () => {
        await signOut(auth);
        await router("/");
    };

    const button = isLoggedIn ? (
        <Button color="inherit" onClick={onClickSignout}>
            Sign out
            <div className={classes.logo}>
                <IconContext.Provider value={{ size: "20px" }}>
                    <FiLogOut />
                </IconContext.Provider>
            </div>
        </Button>
    ) : null;

    const icon = isLoggedIn ? (
        <StyledBadge
            overlap="circular"
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            variant="dot"
        >
            <Avatar
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                className={classes.icon}
                alt=""
                src={user?.photoURL as string}
            />
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={onGeneratefaceOpen}>好みの顔確認</MenuItem>
            </Menu>
        </StyledBadge>
    ) : null;

    const link = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, "to">>(
        (props, ref) => <RouterLink ref={ref} to="/menu" {...props} />
    );
    function handleclallapi() {
        fetch(`/api/get_likeurl` + "?uid=" + user?.uid, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid: user?.uid,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setLikeimage(data.url);
            });
    }
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        <Link component={link} color="inherit">
                            Dataset
                        </Link>
                    </Typography>
                    <Badge
                        overlap="rectangular"
                        badgeContent={4}
                        color="secondary"
                    >
                        <MailIcon />
                    </Badge>
                    <div className={classes.contents}>
                        {button}
                        {icon}
                    </div>
                </Toolbar>
            </AppBar>
            <Dialog
                open={dialogopen}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">好みの顔確認</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        顔によるマッチ度推定に使用
                    </DialogContentText>
                    <Avatar src={likeimage} className={classes.large} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={dialogClose} color="primary">
                        キャンセル
                    </Button>
                    <Button onClick={dialogClose} color="primary">
                        生成
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Header;
