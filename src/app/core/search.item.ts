/*export interface SearchResponse<SearchNews> {
    results: Array<SearchNews>;
}
*/
// export interface SearchItem {
//     trackName: string;
//     artistName: string;
//     previewUrl: string;
//     artistViewUrl: string;
//     artistId: string;
// }

export interface SearchUser {
    id: string;
    username: string;
    email: string;
    roles: string;
}

export interface SearchNews {
    id: string;
    topic: string;
    summary: string;
    date: string;
}
