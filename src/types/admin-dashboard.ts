export type AdminDashboardData = {
    users: number;
    users_active: number;
    movies: number;
    episodes: number;
    comments: number;
    watch_history: number;
    favorites: number;
    notifications: number;
    actors: number;
    categories: number;
    ratings: number;
    servers: number;
};

export type AdminDashboardResponse = {
    data: AdminDashboardData;
};
