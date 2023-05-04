import { MangaImagesEndpoint } from "../interfaces/api";

const proxy = "https://corsproxy.io/?";

export const buildProxyUrl = (url: string) => {
    return proxy + url;
};

export const buildCoverUrl = (mangaId: string, filename: string, size: "256" | "512" | "max") => {
    if (size === "max") return `https://uploads.mangadex.org/covers/${mangaId}/${filename}`;
    return buildProxyUrl(`https://uploads.mangadex.org/covers/${mangaId}/${filename}.${size}.jpg`);
};

export const fetchChapterImages = async (chapterId: string) => {
    return await (await fetch(buildProxyUrl(`https://api.mangadex.org/at-home/server/${chapterId}`))).json() as MangaImagesEndpoint;
};
