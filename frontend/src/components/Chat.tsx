import React from "react";
import { ChatEngine } from "react-chat-engine";
import { useAuthContext } from "../context/AuthContext";

function Chat() {
    const { user } = useAuthContext();
    return (
        <ChatEngine
            projectID="
            5aa81f11-edba-4f73-8e30-a2df07acecfb"
            userName={user?.displayName}
            userSecret={user?.uid}
        />
    );
}

export default Chat;
