import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Container } from "@material-ui/core";

import Signin from "./components/Signin";
import Menu from "./components/Menu";
import Image from "./components/Image";
import Images from "./components/Images";
import Stats from "./components/Stats";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";

const App: React.FC = () => {
    return (
        <BrowserRouter basename="/matching_app">
            <AuthProvider>
                <Header />
                <Container fixed>
                    <Routes>
                        <Route path="/" element={<Signin />}></Route>
                        <Route path="/image/:id" element={<Image />}></Route>
                        <Route path="/menu" element={<Menu />}></Route>
                        <Route path="/images" element={<Images />}></Route>
                        <Route path="/stats" element={<Stats />}></Route>
                    </Routes>
                </Container>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
