export interface ImageResponse {
    id: string;
    image_url: string;
    size: number;
    status: number;
    parts: number[];
    label_name: string;
    source_url: string;
    photo_url: string;
    published_at: number;
    updated_at: number;
    meta: string;
}
export interface UserImageResponse {
    id: string;
    image_url: string;
    vectors: [];
    updated_at: number;
    uid: string;
}

export interface UserImageResponse2 {
    id: string;
    image_url: string;
    vector: Float64Array;
    updated_at: number;
}
