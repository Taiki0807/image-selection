import React, { useEffect, useState } from "react";

const Test = () => {
    const [posts, setPosts] = useState<any>([]);
    useEffect(() => {
        fetch("/fastapi/health", { method: "GET" })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setPosts(data);
            });
    }, []);
    return (
        <div>
            <ul>
                <li>{posts.message}</li>
            </ul>
        </div>
    );
};

export default Test;
