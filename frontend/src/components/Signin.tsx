import React, { useCallback, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { FcGoogle } from 'react-icons/fc';
import { IconContext } from 'react-icons'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  item:{
    textAlign:"center",
    fontSize:"18px",
    display:"flex",
    alignItems:"center",
    "&::before,&::after":{
        content:'""',
        flexGrow:"1",
        height:"1px",
        background:"#666",
        display:"block"
    },
    "&:before":{
        marginRight:".4em"
    },
    "&:after":{
        marginLeft:".4em"
    }
    
  }
}));

const Signin: React.FC = () => {
    const [submitting, setSubmitting] = useState(false);
    const onClickSignIn = useCallback(() => {
        setSubmitting(true);
        (async () => {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                const credential: firebase.auth.UserCredential = await firebase.auth().signInWithPopup(provider);
                if (!credential.user) {
                    throw new Error("no credential user");
                }
                const token = await credential.user.getIdToken();
                const res: Response = await fetch(
                    "/api/signin", {
                        method: "POST",
                        body: JSON.stringify({ token }),
                    },
                );
                if (res.ok) {
                    window.location.replace("/");
                } else {
                    throw new Error(res.statusText);
                }
            } catch (err) {
                alert(err.message);
            } finally {
                setSubmitting(false);
            }
        })();
    }, []);

    const handleSubmit = (event:any) => {
        event.preventDefault();
        const { email, password } = event.target.elements;
        console.log(email.value, password.value);
    };
  
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
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
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
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
            <Grid item xs={12}><p className={classes.item}>or login with</p></Grid>
            <Grid item>
                <Button
                    type="submit"
                    variant="outlined"
                    disabled={submitting}
                    onClick={onClickSignIn}
                >
                    <IconContext.Provider value={{ color: '#ccc', size: '30px' }}>
                        <FcGoogle/>
                    </IconContext.Provider>
                </Button>
            </Grid>
        </Grid>
      </div>
    </Container>
  );
}

export default Signin;