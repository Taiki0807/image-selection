import {
    ReactNode,
    createContext,
    useState,
    useContext,
    useEffect,
} from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { useNavigate } from "react-router";
import { app } from "../firebase";
import { useLocation } from "react-router-dom";

export type UserType = User | null;

export interface AuthContextProps {
    user: UserType;
}

export interface AuthProps {
    children: ReactNode;
}

const AuthContext = createContext<Partial<AuthContextProps>>({});

export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: AuthProps) => {
    const router = useNavigate();
    const location = useLocation();
    const auth = getAuth(app);
    const [user, setUser] = useState<UserType>(null);
    console.log(location.pathname);
    const isAvailableForViewing =
        location.pathname === "/" || location.pathname === "/signup";
    const value = {
        user,
    };

    useEffect(() => {
        const authStateChanged = onAuthStateChanged(auth, async (user) => {
            console.log(user);
            setUser(user);
            console.log(isAvailableForViewing);
            user == null && !isAvailableForViewing && (await router("/"));
        });
        return () => {
            authStateChanged();
        };
    }, []);

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
