import { MangaImagesEndpoint } from "../interfaces/api";

const proxy = "https://corsproxy.io/?";
const imageProxy = "https://api.codetabs.com/v1/proxy/?quest="

export const buildProxyUrl = (url: string) => proxy + url;
export const buildImageUrl = (url: string) => imageProxy + url;

export const buildCoverUrl = (mangaId: string, filename: string, size: "256" | "512" | "max") => {
    if (size === "max") return `https://uploads.mangadex.org/covers/${mangaId}/${filename}`;
    return buildImageUrl(`https://uploads.mangadex.org/covers/${mangaId}/${filename}.${size}.jpg`);
};

export const fetchChapterImages = async (chapterId: string) => {
    return await (await fetch(buildImageUrl(`https://api.mangadex.org/at-home/server/${chapterId}`))).json() as MangaImagesEndpoint;
};
