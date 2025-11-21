export interface Role {    id: string;    name: string;    displayName: string;    description: string;    permissions: string[];    colorScheme: {
        primary: string;
        secondary: string;
    };
    backgroundColor: string;
    color: string;
    menuItems: MenuItem[];
}

export interface MenuItem {
    label: string;
    route: string;
    icon: string;
}