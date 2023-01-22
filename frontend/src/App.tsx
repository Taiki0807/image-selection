import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./styles.css";

import Signin from "./components/Signin";
import Menu from "./components/Menu";
import Image from "./components/Image";
import Images from "./components/Images";
import Stats from "./components/Stats";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";
import Map from "./components/Mappage";
import Signup from "./components/Signup";
import Apitest from "./components/Apitest";
import Selection from "./components/Selection";
import Result_face from "./components/Result_face";
import Matching from "./components/Matching";
import Test from "./components/Test";
import { LikeimageProvider } from "./context/LikeImage";
import Chat from "./components/Chat";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <LikeimageProvider>
                    <Header />
                    <Routes>
                        <Route path="/" element={<Signin />}></Route>
                        <Route path="/image/:id" element={<Image />}></Route>
                        <Route
                            path="/selection/:id"
                            element={<Selection />}
                        ></Route>
                        <Route path="/menu" element={<Menu />}></Route>
                        <Route path="/images" element={<Images />}></Route>
                        <Route path="/stats" element={<Stats />}></Route>
                        <Route path="/map" element={<Map />}></Route>
                        <Route path="/signup" element={<Signup />}></Route>
                        <Route path="/testapi" element={<Apitest />}></Route>
                        <Route path="/result" element={<Result_face />}></Route>
                        <Route path="/chat" element={<Chat />}></Route>
                        <Route
                            path="/matching/:id"
                            element={<Matching />}
                        ></Route>
                        <Route path="/test" element={<Test />}></Route>
                    </Routes>
                </LikeimageProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
