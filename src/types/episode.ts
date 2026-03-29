export type AdminEpisode = {
    id: number;
    movie_id: number;
    name: string;
    slug: string;
    embed_url: string;
    episode_number: number;
    created_at: string;
    updated_at: string;
};

export type EpisodesPagination = {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

export type EpisodesListResponse = {
    data: AdminEpisode[];
    pagination: EpisodesPagination;
};
