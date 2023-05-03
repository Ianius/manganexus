export interface AuthorRelationship {
    id: string;
    type: "author";
    attributes: {};
}

export interface ArtistRelationship {
    id: string;
    type: "artist";
    attributes: {};
}

export interface CoverArtRelationship {
    id: string;
    type: "cover_art";
    attributes: {
        fileName: string;
    };
}

type Relationship = AuthorRelationship | ArtistRelationship | CoverArtRelationship;

export interface MangaEndpoint {
    data: {
        id: string;
        type: string;
        attributes: {
            title: {
                en?: string;
            };
            description: {
                en?: string;
            };
        };
        relationships: Relationship[];
    }[];
}

export interface MangaFeedEndpoint {
    data: {
        id: string;
        type: string;
        attributes: {
            title?: string;
            volume: string;
            chapter: string;
            translatedLanguage: string;
        };
    }[];
    limit: number;
    offset: number;
    total: number;
}

export interface MangaImagesEndpoint {
    result: string;
    baseUrl: string;
    chapter: {
        hash: string;
        data: string[];
        dataSaver: string[];
    };
}
