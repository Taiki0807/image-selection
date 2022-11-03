import React, { useEffect, useState, useRef } from "react";
import {
    useNavigate,
    useLocation,
    NavigateFunction,
    useParams,
} from "react-router";
import { Link as RouterLink, LinkProps } from "react-router-dom";

import {
    Box,
    Button,
    Grid,
    Link,
    Typography,
    Breadcrumbs,
    makeStyles,
    useTheme,
    Container,
    IconButton,
} from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import CloseIcon from "@material-ui/icons/Close";
import FavoriteIcon from "@material-ui/icons/Favorite";
import H from "history";

import { ImageResponse } from "../common/interfaces";
const useStyles = makeStyles({
    tableCell: {
        width: "80%",
        maxWidth: 0,
    },
});

const Canvas: React.FC<{ size: number; image: ImageResponse | undefined }> = ({
    size,
    image,
}) => {
    const canvas = useRef<HTMLCanvasElement>(null);
    if (image != null && canvas.current != null) {
        const ctx = canvas.current.getContext("2d")!;
        const img = new Image();
        img.onload = () => {
            const scale = image.size / size;
            ctx.drawImage(img, 0, 0, size, size);
            ctx.strokeStyle = "cyan";
            ctx.lineWidth = 2;
            for (let i = 0; i < 68; i++) {
                let [x, y] = [image.parts[i * 2], image.parts[i * 2 + 1]];
                x /= scale;
                y /= scale;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.stroke();
            }
        };
        img.src = image.image_url;
    }
    return (
        <Box width={size}>
            <canvas height={size} width={size} ref={canvas} />
        </Box>
    );
};

const Matching: React.FC = () => {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up("sm"));
    const history = useNavigate();
    const location = useLocation();
    const [images, setImages] = useState<ImageResponse[]>([]);
    const last = useRef<string>();
    const [index, setIndex] = useState(0);
    const params = new URLSearchParams(location.search);
    const [sort, setSort] = useState<string>(params.get("sort") || "id");
    const [order, setOrder] = useState<string>(params.get("order") || "asc");
    const param = useParams<{ id: string }>();
    const loadImages = (
        history: NavigateFunction,
        location: H.Location,
        images: ImageResponse[]
    ) => {
        params.set("count", "100");
        if (last.current) {
            params.set("id", last.current);
        }
        fetch(`/api/images?${params}`)
            .then((res: Response) => {
                if (res.ok) {
                    return res.json();
                }
                if (res.status === 401) {
                    history("/");
                    return;
                }
                throw new Error(res.statusText);
            })
            .then((data: ImageResponse[]) => {
                console.log(data.length);
                if (data.length === 0) {
                    return;
                }
                last.current = data[data.length - 1].id;
                const ids = new Set(
                    images.map((value: ImageResponse) => value.id)
                );
                setImages(
                    images.concat(
                        data.filter((value: ImageResponse) => {
                            return !ids.has(value.id);
                        })
                    )
                );
            })
            .catch((err: Error) => {
                window.console.error(err.message);
            });
    };
    useEffect(() => {
        console.log(location.search.length);
        if (location.search.length === 0) {
            return;
        }
        if (images.length > 0) {
            if (last.current && last.current === images[images.length - 1].id) {
                return;
            }
        }
        setIndex(Number(param.id));
        loadImages(history, location, images);
    }, []);
    useEffect(() => {
        if (last.current) {
            last.current = undefined;
        }
        setImages([]);
    }, [location]);

    const resetForm = () => {
        setSort("id");
        setOrder("asc");
    };
    useEffect(() => {
        const params = new URLSearchParams({ sort, order });
        const name = new URLSearchParams(location.search).get("name");
        if (name) {
            params.set("name", name);
        }
        if (`?${params}` !== location.search) {
            history(
                {
                    pathname: location.pathname,
                    search: params.toString(),
                },
                { replace: true }
            );
        }
    }, [sort, order, history, location]);
    useEffect(() => {
        console.log("index:" + index);
        if (index < images.length && index >= 0) {
            console.log("ok");
            history(
                {
                    pathname: `/matching/${index}`,
                    search: location.search,
                },
                { replace: true }
            );
        }
    }, [index]);

    const nextImage = () => {
        setIndex(Number(param.id) + 1);
    };
    const prevImage = () => {
        setIndex(Number(param.id) - 1);
    };

    const current = (): ImageResponse => {
        return images[index];
    };

    const link = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, "to">>(
        (props, ref) => {
            const to = {
                pathname: "/map",
                search: location.search,
            };
            return <RouterLink ref={ref} to={to} {...props} />;
        }
    );
    return (
        <Container fixed>
            <Box my={5}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link color="inherit" component={link}>
                        Map
                    </Link>
                    <Typography color="textPrimary">Image</Typography>
                </Breadcrumbs>
            </Box>
            <Grid container>
                <Grid item xs={12}>
                    <Grid container justifyContent="center">
                        <Canvas size={matches ? 512 : 384} image={current()} />
                    </Grid>
                    <Grid container justifyContent="space-between">
                        <Box>
                            <Button onClick={() => prevImage()}>
                                <ArrowBack />
                            </Button>
                        </Box>
                        <Box>
                            <FavoriteIcon>
                                <Box mx={1}>NG</Box>
                            </FavoriteIcon>
                            <FavoriteIcon>
                                <Box mx={1}>Pending</Box>
                            </FavoriteIcon>
                            <FavoriteIcon>
                                <Box mx={1}>OK</Box>
                            </FavoriteIcon>
                        </Box>
                        <Box>
                            <Button onClick={() => nextImage()}>
                                <ArrowForward />
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Matching;
