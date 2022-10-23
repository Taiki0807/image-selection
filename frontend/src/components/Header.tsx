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

const useStyles = makeStyles(() => {
    return createStyles({
        title: {
            flexGrow: 1,
        },
        logo: {
            marginLeft: "10px",
        },
    });
});

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

    const link = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, "to">>(
        (props, ref) => <RouterLink ref={ref} to="/" {...props} />
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
                    {button}
                </Toolbar>
            </AppBar>
        </>
    );
};

export default Header;
