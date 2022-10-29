import React from "react";
import { Link as RouterLink, LinkProps } from "react-router-dom";
import {
    AppBar,
    Link,
    Toolbar,
    Typography,
    makeStyles,
    createStyles,
    Button,
} from "@material-ui/core";
import { useAuthContext } from "../context/AuthContext";
import { app } from "../firebase";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { IconContext } from "react-icons";
import { FiLogOut } from "react-icons/fi";
import Badge from "@material-ui/core/Badge";
import Avatar from "@material-ui/core/Avatar";
import { Theme, withStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => {
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
                className={classes.icon}
                alt=""
                src={user?.photoURL as string}
            />
        </StyledBadge>
    ) : null;

    const link = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, "to">>(
        (props, ref) => <RouterLink ref={ref} to="/menu" {...props} />
    );
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        <Link component={link} color="inherit">
                            Dataset
                        </Link>
                    </Typography>
                    <div className={classes.contents}>
                        {button}
                        {icon}
                    </div>
                </Toolbar>
            </AppBar>
        </>
    );
};

export default Header;
