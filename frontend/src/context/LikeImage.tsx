import { createContext, useState, useContext, ReactNode } from "react";

export type ImageType = {
    likeimage: string | null;
    setLikeimage: React.Dispatch<React.SetStateAction<string | null>>;
};
const iUserContextState = {
    likeimage: null,
    setLikeimage: () => {},
};
export interface ImageProps {
    children: ReactNode;
}

const SaveImageContext = createContext<ImageType>(iUserContextState);

export function ImageContext() {
    return useContext(SaveImageContext);
}

export function LikeimageProvider({ children }: ImageProps) {
    const [likeimage, setLikeimage] = useState("");
    const values = {
        likeimage,
        setLikeimage,
    };

    return (
        <SaveImageContext.Provider value={values as ImageType}>
            {children}
        </SaveImageContext.Provider>
    );
}
