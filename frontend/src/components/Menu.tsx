import React from "react";
import { Link as RouterLink, LinkProps } from "react-router-dom";
import { Link, List, ListItem, Container } from "@material-ui/core";

const Menu: React.FC = () => {
    const link = React.forwardRef<HTMLAnchorElement, LinkProps>(
        (props, ref) => {
            return <RouterLink ref={ref} {...props} />;
        }
    );
    return (
        <Container fixed>
            <List>
                <ListItem>
                    <Link component={link} to="/images">
                        Images
                    </Link>
                </ListItem>
                <ListItem>
                    <Link component={link} to="/stats">
                        Stats
                    </Link>
                </ListItem>
                <ListItem>
                    <Link component={link} to="/map">
                        map
                    </Link>
                </ListItem>
                <ListItem>
                    <Link component={link} to="/selection/0">
                        顔生成(好み選別)
                    </Link>
                </ListItem>
                <ListItem>
                    <Link component={link} to="/result">
                        好み顔確認
                    </Link>
                </ListItem>
                <ListItem>
                    <Link component={link} to="/matching/0">
                        マッチング
                    </Link>
                </ListItem>
                <ListItem>
                    <Link component={link} to="/chat">
                        Chat
                    </Link>
                </ListItem>
            </List>
        </Container>
    );
};

export default Menu;
