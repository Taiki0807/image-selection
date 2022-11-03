import React, { useEffect, useState } from "react";

const Apitest = () => {
    const [posts, setPosts] = useState<any>([]);
    useEffect(() => {
        fetch("/api/imagelike", { method: "GET" })
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

export default Apitest;
