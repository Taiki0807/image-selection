import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router";
import { Link as RouterLink, LinkProps } from "react-router-dom";
import { GlobalHotKeys } from "react-hotkeys";
import {
    Box,
    Button,
    Grid,
    Link,
    Typography,
    Breadcrumbs,
    Table,
    TableBody,
    TableRow,
    TableCell,
    makeStyles,
    useTheme,
    Container,
} from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import { ArrowBack, ArrowForward } from "@material-ui/icons";

import { ImageResponse } from "../common/interfaces";

const bufferLength = 100;
const bufferThreshold = 20;

const useStyles = makeStyles({
    tableCell: {
        width: "80%",
        maxWidth: 0,
    },
});

const InfoTable: React.FC<ImageResponse> = (image: ImageResponse) => {
    const classes = useStyles();
    const meta = Object.entries(JSON.parse(image.meta)).map((value, index) => {
        return (
            <Box key={index} fontFamily="Monospace" fontSize="body1.fontSize">
                <>
                    {value[0]}: {value[1]}
                </>
            </Box>
        );
    });
    const link = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, "to">>(
        (props, ref) => {
            const params = new URLSearchParams({ name: image.label_name });
            const to = {
                pathname: "/images",
                search: params.toString(),
            };
            return <RouterLink ref={ref} to={to} {...props} />;
        }
    );
    return (
        <Table>
            <TableBody>
                <TableRow>
                    <TableCell component="th" scope="row">
                        ID
                    </TableCell>
                    <TableCell>
                        <Box fontSize="h6.fontSize" fontFamily="Monospace">
                            {image.id}
                        </Box>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell component="th" scope="row">
                        Name
                    </TableCell>
                    <TableCell>
                        <Link component={link}>{image.label_name}</Link>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell component="th" scope="row">
                        Size
                    </TableCell>
                    <TableCell>
                        <Box fontSize="body1.fontSize" fontFamily="Monospace">
                            {image.size}
                        </Box>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell component="th" scope="row">
                        Photo URL
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                        <Link
                            href={image.photo_url}
                            target="_blank"
                            rel="noopener"
                        >
                            <Typography
                                variant="inherit"
                                noWrap={true}
                                display="block"
                            >
                                {image.photo_url}
                            </Typography>
                        </Link>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell component="th" scope="row">
                        Source URL
                    </TableCell>
                    <TableCell>
                        <Link
                            href={image.source_url}
                            target="_blank"
                            rel="noopener"
                        >
                            {image.source_url}
                        </Link>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell component="th" scope="row">
                        Published at
                    </TableCell>
                    <TableCell>
                        {new Date(image.published_at * 1000).toISOString()}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell component="th" scope="row">
                        Updated at
                    </TableCell>
                    <TableCell>
                        {new Date(image.updated_at * 1000).toISOString()}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell component="th" scope="row">
                        Meta
                    </TableCell>
                    <TableCell>{meta}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
};

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

const ImageViewer: React.FC = () => {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up("sm"));
    const history = useNavigate();
    const location = useLocation();
    const params = useParams<{ id: string }>();
    const [images, setImages] = useState<ImageResponse[]>([]);
    const [terminated, setTerminated] = useState<[boolean, boolean]>([
        false,
        false,
    ]);
    const keyMap = {
        NEXT_IMAGE: ["ctrl+f", "right"],
        PREV_IMAGE: ["ctrl+b", "left"],
        STATUS_1: ["1"],
        STATUS_2: ["2"],
        STATUS_3: ["3"],
    };
    const nextImage = () => {
        const index = images.findIndex(
            (element: ImageResponse) => element.id === params.id
        );
        if (index + 1 < images.length) {
            history(
                {
                    pathname: `/image/${images[index + 1].id}`,
                    search: location.search,
                },
                { replace: true }
            );
        }
    };
    const prevImage = () => {
        const index = images.findIndex(
            (element: ImageResponse) => element.id === params.id
        );
        if (index - 1 >= 0) {
            history(
                {
                    pathname: `/image/${images[index - 1].id}`,
                    search: location.search,
                },
                { replace: true }
            );
        }
    };
    const handlers = {
        NEXT_IMAGE: nextImage,
        PREV_IMAGE: prevImage,
        STATUS_1: async () => await updateStatus(1),
        STATUS_2: async () => await updateStatus(2),
        STATUS_3: async () => await updateStatus(3),
    };
    const current = images.find(
        (element: ImageResponse) => element.id === params.id
    );
    const updateStatus = async (status: number) => {
        const res: Response = await fetch(`/api/image/${params.id}`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            if (current != null) {
                current.status = status;
                current.updated_at = Math.floor(new Date().getTime() / 1000);
            }
            nextImage();
        } else {
            console.error(res.status);
        }
    };
    useEffect(() => {
        const fetchData = async (
            id: string,
            reverse: boolean = false
        ): Promise<ImageResponse[]> => {
            const params: URLSearchParams = new URLSearchParams(
                location.search
            );
            params.set("id", id);
            if (reverse) {
                params.set("reverse", "true");
            }
            if (!params.has("sort")) {
                params.set("sort", "id");
            }
            const res = await fetch(`/api/images?${params.toString()}`);
            if (res.ok) {
                const images: ImageResponse[] = await res.json();
                if (reverse) {
                    images.reverse();
                }
                return await Promise.resolve(images);
            } else {
                return await Promise.reject(res.status);
            }
        };
        const requests: [Promise<ImageResponse[]>, Promise<ImageResponse[]>] = [
            Promise.resolve([]),
            Promise.resolve([]),
        ];
        if (images.length > 0) {
            const index = images.findIndex(
                (element: ImageResponse) => element.id === params.id
            );
            if (index < bufferThreshold && !terminated[0]) {
                requests[0] = fetchData(images[0].id, true);
            }
            if (images.length - index <= bufferThreshold && !terminated[1]) {
                requests[1] = fetchData(images[images.length - 1].id, false);
            }
        } else {
            requests[0] = fetchData(params.id as string, true);
            requests[1] = fetchData(params.id as string, false);
        }
        Promise.all(requests)
            .then((results: ImageResponse[][]) => {
                if (results[0].length > 0 || results[1].length > 0) {
                    const map = new Map();
                    [results[0], images, results[1]]
                        .flat()
                        .forEach((value: ImageResponse) => {
                            map.set(value.id, value);
                        });
                    const values = Array.from(map.values());
                    if (values.length === images.length) {
                        if (results[0].length > 0) {
                            setTerminated([true, terminated[1]]);
                        } else {
                            setTerminated([terminated[0], true]);
                        }
                    } else {
                        const indexOld = images.findIndex(
                            (element: ImageResponse) => element.id === params.id
                        );
                        const indexNew = values.findIndex(
                            (element: ImageResponse) => element.id === params.id
                        );
                        if (indexOld === indexNew) {
                            while (
                                values.length > bufferLength &&
                                values[bufferThreshold].id !== params.id
                            ) {
                                values.shift();
                            }
                        } else {
                            while (
                                values.length > bufferLength &&
                                values[values.length - bufferThreshold - 1]
                                    .id !== params.id
                            ) {
                                values.pop();
                            }
                        }
                    }
                    setImages(values);
                }
            })
            .catch((err) => {
                if (err === 401) {
                    history("/");
                } else {
                    window.console.error(err);
                }
            });
    }, [location, history, params.id, images, terminated]);
    const link = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, "to">>(
        (props, ref) => {
            const to = {
                pathname: "/images",
                search: location.search,
            };
            return <RouterLink ref={ref} to={to} {...props} />;
        }
    );
    return (
        <Container fixed>
            <Box my={2}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link color="inherit" component={link}>
                        Images
                    </Link>
                    <Typography color="textPrimary">Image</Typography>
                </Breadcrumbs>
            </Box>
            <Grid container>
                <Grid item xs={12} lg={6}>
                    <Grid container justify="center">
                        <Canvas size={matches ? 512 : 384} image={current} />
                    </Grid>
                    <Grid container justify="space-between">
                        <Box>
                            <Button onClick={() => prevImage()}>
                                <ArrowBack />
                            </Button>
                        </Box>
                        <Box>
                            <ToggleButtonGroup
                                exclusive
                                size="small"
                                value={current != null && current.status}
                            >
                                <ToggleButton
                                    value={1}
                                    onClick={async () => await updateStatus(1)}
                                >
                                    <Box mx={1}>NG</Box>
                                </ToggleButton>
                                <ToggleButton
                                    value={2}
                                    onClick={async () => await updateStatus(2)}
                                >
                                    <Box mx={1}>Pending</Box>
                                </ToggleButton>
                                <ToggleButton
                                    value={3}
                                    onClick={async () => await updateStatus(3)}
                                >
                                    <Box mx={1}>OK</Box>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                        <Box>
                            <Button onClick={() => nextImage()}>
                                <ArrowForward />
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
                <Grid item xs={12} lg={6}>
                    {current != null && <InfoTable {...current} />}
                </Grid>
            </Grid>
            <GlobalHotKeys
                keyMap={keyMap}
                handlers={handlers}
                allowChanges={true}
            />
        </Container>
    );
};

export default ImageViewer;
