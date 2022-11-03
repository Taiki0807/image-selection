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
                    <Link component={link} to="/matching/0">
                        matching
                    </Link>
                </ListItem>
            </List>
        </Container>
    );
};

export default Menu;
