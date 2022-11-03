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

const App: React.FC = () => {
    return (
        <BrowserRouter basename="/matching_app">
            <AuthProvider>
                <Header />
                <Routes>
                    <Route path="/" element={<Signin />}></Route>
                    <Route path="/image/:id" element={<Image />}></Route>
                    <Route path="/menu" element={<Menu />}></Route>
                    <Route path="/images" element={<Images />}></Route>
                    <Route path="/stats" element={<Stats />}></Route>
                    <Route path="/map" element={<Map />}></Route>
                    <Route path="/signup" element={<Signup />}></Route>
                    <Route path="/apitest" element={<Apitest />}></Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
