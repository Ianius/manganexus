import { MangaImagesEndpoint } from "../interfaces/api";

export const buildCoverUrl = (mangaId: string, filename: string, size: "256" | "512" | "max") => {
    if (size === "max") return `https://uploads.mangadex.org/covers/${mangaId}/${filename}`;
    return `https://uploads.mangadex.org/covers/${mangaId}/${filename}.${size}.jpg`;
};

export const fetchChapterImages = async (chapterId: string) => {
    return await (await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`)).json() as MangaImagesEndpoint;
};
