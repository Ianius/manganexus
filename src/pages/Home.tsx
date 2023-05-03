import { useState } from "react";
import { useApiCall } from "../hooks/api";
import { CoverArtRelationship, MangaEndpoint } from "../interfaces/api";
import { buildCoverUrl } from "../util/api";

import MangaCard from "../components/MangaCard";
import bg from '../assets/bg.png';

const Home = () => {
    const [search, setSearch] = useState("");
    const { isLoading, error, result } = useApiCall<MangaEndpoint>(`https://api.mangadex.org/manga?title=${search}&includes[]=author&includes[]=artist&includes[]=cover_art`);

    const [input, setInput] = useState("");
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

    if (error) return <div>Error!</div>;

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedSearch = e.target.value;

        setInput(updatedSearch);
        clearTimeout(searchTimeout);

        setSearchTimeout(setTimeout(() => setSearch(updatedSearch), 1000));
    };

    return (
        <div 
            className='flex flex-col items-center gap-8 p-4'
        >
            <div
                className='relative overflow-hidden w-full'
            >
                <img 
                    className='w-full max-h-96 object-cover rounded-md'
                    src={bg}
                />
            </div>

            <div
                className='flex flex-col gap-8 w-full max-w-4xl'
            >
                <div className='relative'>
                    <input
                        className="p-2 rounded-sm transition-all w-full outline-none peer bg-gray-600"
                        placeholder='Search for a manga!'
                        onChange={onInputChange}
                        value={input}
                    />
                    
                    <div
                        className='absolute left-0 top-0 w-full h-full transition-all box-border rounded-sm border-transparent border-2 peer-focus:border-orange-500 pointer-events-none'
                    />
                </div>

                {isLoading &&
                    // Change this
                    <div>Loading!</div>
                }
                
                {(!isLoading && result) &&
                    (
                        result.data.length === 0
                            ? <div>0 Search results</div>
                            : result.data.map(manga => {
                                const title = manga.attributes.title.en;
                                const description = manga.attributes.description.en;

                                if (!(title && description)) return undefined;
                                
                                const coverRel = manga.relationships.find(r => r.type === "cover_art") as CoverArtRelationship;
                                const coverUrl = buildCoverUrl(manga.id, coverRel.attributes.fileName, "256");

                                return <MangaCard key={manga.id} id={manga.id} title={title} coverUrl={coverUrl} description={description}/>;
                            })
                    )
                }
            </div>
        </div>
    );
};

export default Home;
