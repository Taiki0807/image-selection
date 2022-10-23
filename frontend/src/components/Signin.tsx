import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { FcGoogle } from "react-icons/fc";
import { IconContext } from "react-icons";
import { useNavigate } from "react-router";
import { app } from "../firebase";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { useAuthContext } from "../context/AuthContext";

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    item: {
        textAlign: "center",
        fontSize: "18px",
        display: "flex",
        alignItems: "center",
        "&::before,&::after": {
            content: "''",
            flexGrow: "1",
            height: "1px",
            background: "#666",
            display: "block",
        },
        "&:before": {
            marginRight: ".4em",
        },
        "&:after": {
            marginLeft: ".4em",
        },
    },
}));

const Signin: React.FC = () => {
    const history = useNavigate();
    const auth = getAuth(app);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [login, setLogin] = useState(false);
    const [err, setErr] = useState(false);
    const { user } = useAuthContext();
    const isLoggedIn = !(user == null);

    const handleSubmit_email = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            await signInWithEmailAndPassword(auth, email, password);
            setLogin(true);
        } catch (error: any) {
            console.log(error);
            setErr(true);
        }
    };
    const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.currentTarget.value);
    };
    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.currentTarget.value);
    };

    const handleSubmit_google = async (event: any) => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await firebase.auth().signInWithPopup(provider);
            history("/menu");
        } catch (error: any) {
            console.log(error);
            setErr(true);
        }
    };

    const handleClose_success = async () => {
        await history("/menu");
    };
    const handleClose_err = async () => {
        setErr(false);
    };

    const classes = useStyles();

    return (
        <div>
            <Snackbar
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                open={login}
                autoHideDuration={3000}
                onClose={handleClose_success}
            >
                <Alert onClose={handleClose_success} severity="success">
                    ログイン成功!
                </Alert>
            </Snackbar>
            <Snackbar
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                open={err}
                autoHideDuration={3000}
                onClose={handleClose_err}
            >
                <Alert onClose={handleClose_err} severity="error">
                    ログイン失敗
                </Alert>
            </Snackbar>
            <Snackbar
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                open={isLoggedIn && !login}
                autoHideDuration={3000}
                onClose={handleClose_success}
            >
                <Alert onClose={handleClose_success} severity="warning">
                    すでにログインしています
                </Alert>
            </Snackbar>

            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <form
                        className={classes.form}
                        noValidate
                        onSubmit={handleSubmit_email}
                    >
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            onChange={handleChangeEmail}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            onChange={handleChangePassword}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox value="remember" color="primary" />
                            }
                            label="Remember me"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Sign In
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link href="#" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="#" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
                    <Grid container justifyContent="center">
                        <Grid item xs={12}>
                            <p className={classes.item}>or login with</p>
                        </Grid>
                        <Grid item>
                            <Button
                                type="submit"
                                variant="outlined"
                                onClick={handleSubmit_google}
                            >
                                <IconContext.Provider
                                    value={{ color: "#ccc", size: "30px" }}
                                >
                                    <FcGoogle />
                                </IconContext.Provider>
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </Container>
        </div>
    );
};

export default Signin;
