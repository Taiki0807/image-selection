import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";

const Result_face = () => {
    const { user } = useAuthContext();
    const [generate, setGenerate] = useState(false);
    const [image, setImage] = useState("");
    const [uid, setUid] = useState(user?.uid);

    function handleclallapi() {
        fetch(`/make_face/` + uid, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                u_id: user?.uid,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if (data.status === "ok") {
                    setGenerate(true);
                    setImage(data.face_url);
                }
            });
    }

    const handleClose_success = async () => {
        setGenerate(false);
    };
    useEffect(() => {
        setUid(user?.uid);
    }, [user?.uid]);

    return (
        <div>
            <Snackbar
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                open={generate}
                autoHideDuration={3000}
                onClose={handleClose_success}
            >
                <Alert onClose={handleClose_success} severity="success">
                    成功!
                </Alert>
            </Snackbar>
            <Button
                onClick={() => handleclallapi()}
                variant="contained"
                color="primary"
            >
                Primary
            </Button>
            <img src={image} alt="Image" />
        </div>
    );
};

export default Result_face;
