import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { ChatEngine, getOrCreateChat } from "react-chat-engine";
import { useAuthContext } from "../context/AuthContext";
import "../../src/styles.css";

function Chat() {
    const { user } = useAuthContext();
    const [username, setUsername] = useState("");
    const [loding, setLoding] = useState(true);
    const isLoggedIn = !(user == null);

    useEffect(() => {
        if (isLoggedIn) {
            console.log("Ok");
            axios
                .get("https://api.chatengine.io/users/me/", {
                    headers: {
                        "project-id": "5aa81f11-edba-4f73-8e30-a2df07acecfb",
                        "user-name": user?.email,
                        "user-secret": user?.uid,
                    },
                })
                .then(() => {
                    setLoding(false);
                })
                .catch(() => {
                    console.log(user);
                    axios
                        .put(
                            "https://api.chatengine.io/users/",
                            {
                                email: user.email as string,
                                username: user.displayName as string,
                                secret: user.uid,
                            },
                            {
                                headers: {
                                    "PRIVATE-KEY":
                                        "a61863da-50f6-4797-8e4a-0dc9b05d1184",
                                },
                            }
                        )
                        .then(() => {
                            setLoding(false);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                });
        }
    }, [isLoggedIn]);

    function createDirectChat() {
        getOrCreateChat({ is_direct_chat: true, usernames: [username] }, () =>
            setUsername("")
        );
    }
    if (!user || loding) return <div>loading...</div>;
    return (
        <ChatEngine
            height="93vh"
            projectID="
            5aa81f11-edba-4f73-8e30-a2df07acecfb"
            userName={user?.displayName}
            userSecret={user?.uid}
        />
    );
}

export default Chat;
