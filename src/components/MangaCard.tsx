import { ComponentType, ReactNode, useState } from "react";
import { useApiCall } from "../hooks/api";
import { MangaFeedEndpoint, MangaImagesEndpoint } from "../interfaces/api";
import { fetchChapterImages } from "../util/api";
import { saveAs } from 'file-saver';
import { HiDotsHorizontal } from 'react-icons/hi';
import { BsArrowRight, BsArrowLeft } from 'react-icons/bs';
import JSZip from "jszip";

interface Props {
    id: string;
    title: string;
    coverUrl: string;
    description: string;
}

const MangaCard = ({ id, title, coverUrl, description }: Props) => {
    const MAX_DESC_LENGTH = 200;
    const CHAPTER_LIMIT = 10;
    
    const [page, setPage] = useState(0);
    const { isLoading, error, result } = useApiCall<MangaFeedEndpoint>(`https://api.mangadex.org/manga/${id}/feed?order[chapter]=asc&translatedLanguage[]=en&limit=${CHAPTER_LIMIT}&offset=${page * CHAPTER_LIMIT}`);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedChapters, setSelectedChapters] = useState(new Map<string, string>()); // <id, chapter_number + chapter_name>
    const [toggleSelectAll, setToggleSelectAll] = useState(false);
    const [download, setDownload] = useState({ inProgress: false, progress: 0 });
    
    if (error)
        return <div>Error! {error.message}</div>
    
    if (description.length > MAX_DESC_LENGTH && !isOpen) 
        description = description.slice(0, MAX_DESC_LENGTH - 3).trim() + "...";
    
    const chapters = result?.data;
    const amountSelected = selectedChapters.size;
    const totalChapters = result?.total ?? 0;
    const totalPages = Math.ceil(totalChapters / CHAPTER_LIMIT);

    const trySetPage = (page: number) => {
        if (page < totalPages && page >= 0) setPage(page);
    };

    const getChapterFolderName = (chapter: string, title?: string) => chapter + (title ? ": " + title : "");

    return (
        <div
            className='flex flex-col gap-4'
        >
            <div
                className='flex flex-col gap-4 p-3 overflow-hidden bg-zinc-700 rounded-md hover:bg-zinc-800 transition-all cursor-pointer shadow-md'
                onClick={() => setIsOpen(!isOpen)}
            >
                <div
                    className='flex gap-4'
                >
                    <img className='w-auto h-[150px] flex-col aspect-[256/364] rounded-md shadow-md' src={coverUrl} />

                    <div
                        className='flex flex-col'
                    >
                        <h1 className='text-lg font-bold'>{title}</h1>

                        <p>
                            {description}
                        </p>
                    </div>

                    <h1 className='text-xl'>
                        {isOpen ? "-" : "+"}
                    </h1>
                </div>
            </div>
            
            {(chapters && isOpen) &&
                <>
                    <div>
                        <p className='inline'>Showing chapters of   </p>
                        <div className='inline'>{" "}</div>
                        <div className='inline text-orange-500'>{title}</div>
                    </div>

                    {download.inProgress &&
                        <div>Download in progress: {download.progress}%</div>
                    }

                    <div className='flex gap-2 justify-center items-center'>
                        <div>{amountSelected} chapters selected</div>

                        <div className='flex-1'/>

                        <button 
                            className='p-2 transition-all text-blue-500 hover:text-blue-700'
                            onClick={_ => {
                                let newMap = new Map<string, string>();

                                const newState = !toggleSelectAll;
                                if (newState) {
                                    chapters
                                        .forEach(chapter => {
                                            newMap.set(chapter.id, getChapterFolderName(chapter.attributes.chapter, chapter.attributes.title))
                                        });
                                }

                                setToggleSelectAll(newState);
                                setSelectedChapters(newMap);
                            }}
                        >
                            {toggleSelectAll ? "Deselect all" : "Select all"}
                        </button>

                        <button 
                            onClick={async _ => {
                                const addToZip = async (zip: JSZip, name: string, url: string) => {
                                    // Download single file as blob and add it to zip file

                                    const res = await fetch(url);
                                    const blob = await res.blob();

                                    zip.file(name, blob);
                                };

                                if (selectedChapters.size === 0 || download.inProgress) return;

                                setDownload({ inProgress: true, progress: 0});

                                const zip = new JSZip();
                                const data: { res: MangaImagesEndpoint, folderName: string }[] = [];

                                let downloaded = 0;
                                let totalImages = 0;

                                for (let [chapterId, chapterName] of selectedChapters) {
                                    const images = await fetchChapterImages(chapterId);
                                    data.push({ res: images, folderName: chapterName });
                                    totalImages += images.chapter.data.length;
                                }

                                for (let { res, folderName } of data) {
                                    const folder = zip.folder(folderName)!;

                                    for (let fileName of res.chapter.data) {
                                        const url = res.baseUrl + "/data/" + res.chapter.hash + "/" + fileName;

                                        await addToZip(folder, fileName, url);

                                        setDownload({ inProgress: true, progress: (++downloaded / totalImages) * 100 });
                                    }
                                }

                                const blob = await zip.generateAsync({ type: "blob" });

                                saveAs(blob, `${title}.zip`);
                                setDownload({ inProgress: false, progress: 0 });
                            }}

                            className='p-2 bg-orange-500 rounded-md hover:bg-orange-600 transition-all'
                        >
                            Download selected
                        </button>
                    </div>

                    <div className='flex flex-col gap-3 relative'>
                        {isLoading &&
                            <div
                                className='absolute top-0 left-0 w-full h-full bg-zinc-500 opacity-20 rounded-md'
                            />
                        }

                        {chapters
                            .map(chapter => {
                                const selected = selectedChapters.get(chapter.id);
                                const chapterTitle = chapter.attributes.title && chapter.attributes.title.length > 0 ? chapter.attributes.title : "No chapter title available";

                                return (
                                    <div
                                        key={chapter.id}
                                        className={`flex gap-2 items-center p-2 ${selected ? "text-black" : "text-white"} ${selected ? "bg-green-500" : "bg-zinc-700"} ${selected ? "hover:bg-green-700" : "hover:bg-zinc-800"} transition-all rounded-md cursor-pointer`}
                                        onClick={_ => {
                                            const copy = new Map(selectedChapters);
                                            if (selectedChapters.get(chapter.id)) copy.delete(chapter.id);
                                            else {
                                                console.log("folder:", getChapterFolderName(chapter.attributes.chapter, chapter.attributes.title));
                                                copy.set(chapter.id, getChapterFolderName(chapter.attributes.chapter, chapter.attributes.title));
                                            }
                                            setSelectedChapters(copy)
                                        }}
                                    >
                                        <div className='w-24'>Ch. {chapter.attributes.chapter + ":"}</div>
                                        <div key={chapter.id}>{chapterTitle}</div>
                                    </div>
                                );
                            })}
                    </div>

                    <div
                        className='flex flex-wrap justify-center items-center gap-4'
                    >
                        {(() => {
                            const PAGES_PADDING = 2;
                            const MIN_WIDTH_AND_HEIGHT = "min-w-[2.5em] min-h-[2.5em]"

                            interface PageSelectorProps {
                                active?: boolean;
                                page: number;
                            }

                            interface IconProps {
                                Component: ComponentType<any>;
                            }

                            interface ArrowProps {
                                Component: ComponentType<any>;
                                onClick: () => void;
                                active: boolean;
                            }

                            const PageSelector = ({ active = false, page }: PageSelectorProps) => {
                                return (
                                    <button
                                        onClick={_ => trySetPage(page)}
                                        className={`${MIN_WIDTH_AND_HEIGHT} rounded-md transition-all ${active ? "bg-orange-500" : ""} ${active ? "hover:bg-orange-700" : "hover:bg-zinc-700"}`}
                                    >
                                        <span>
                                            {page + 1}
                                        </span>
                                    </button>
                                );
                            };

                            const Icon = ({ Component: Icon }: IconProps) => <div className={`${MIN_WIDTH_AND_HEIGHT} flex items-center justify-center`}><Icon className='w-1/2 h-1/2'/></div>;

                            const Arrow = ({ Component, onClick, active }: ArrowProps) => <button className={`hover:bg-zinc-700 rounded-full ${active ? "text-white" : "text-zinc-700"}`} onClick={onClick}><Icon Component={Component}/></button>;

                            const results: ReactNode[] = [];

                            results.push(
                                <Arrow
                                    onClick={() => trySetPage(page - 1)}
                                    Component={BsArrowLeft}
                                    active={page > 0}
                                />
                            );

                            if (page > PAGES_PADDING) results.push(<PageSelector page={0}/>);
                            if (page > PAGES_PADDING + 1) results.push(<Icon Component={HiDotsHorizontal}/>);

                            for (let i = page - PAGES_PADDING; i <= page + PAGES_PADDING; i++) {
                                if (i < 0) continue;
                                if (i > totalPages - 1) break;
                                results.push(<PageSelector active={page === i} page={i}/>)
                            }

                            if (page + PAGES_PADDING < totalPages - 2) results.push(<Icon Component={HiDotsHorizontal}/>);
                            if (page + PAGES_PADDING < totalPages - 1) results.push(<PageSelector page={totalPages - 1}/>);

                            results.push(
                                <Arrow
                                    onClick={() => trySetPage(page + 1)}
                                    Component={BsArrowRight}
                                    active={page < totalPages - 1}
                                />
                            );

                            return results;
                        })()}
                    </div>
                </>
            }
        </div>
    );
};

export default MangaCard;
