import React, { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { Button } from "@material-ui/core";

const Apitest = () => {
    const [posts, setPosts] = useState<any>([]);
    const { user } = useAuthContext();
    const score = () => {
        fetch(`/fastapi/make_face/${user?.uid}`, {
            method: "POST",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                u_id: user?.uid,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setPosts(data);
            });
    };
    return (
        <div>
            <Button onClick={() => score()} variant="contained" color="primary">
                顔生成
            </Button>
            <ul>
                <li>{posts.status}</li>
            </ul>
        </div>
    );
};

export default Apitest;
