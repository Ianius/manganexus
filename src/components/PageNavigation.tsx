import { ComponentType, ReactNode } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { HiDotsHorizontal } from "react-icons/hi";

const PAGES_PADDING = 2;
const MIN_WIDTH_AND_HEIGHT = "min-w-[2.5em] min-h-[2.5em]"

interface PageSelectorProps {
    active?: boolean;
    page: number;
    setter: (page: number) => void;
}

interface IconProps {
    Component: ComponentType<any>;
}

interface ArrowProps {
    Component: ComponentType<any>;
    onClick: () => void;
    active: boolean;
}

interface PageNavigationProps {
    page: number;
    totalPages: number;
    setter: (page: number) => void;
}

const PageSelector = ({ active = false, page, setter }: PageSelectorProps) => {
    return (
        <button
            onClick={_ => setter(page)}
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

const PageNavigation = ({ page, totalPages, setter }: PageNavigationProps) => {
    const results: ReactNode[] = [];

    results.push(
        <Arrow
            onClick={() => setter(page - 1)}
            Component={BsArrowLeft}
            active={page > 0}
        />
    );

    if (page > PAGES_PADDING) results.push(<PageSelector page={0} setter={setter}/>);
    if (page > PAGES_PADDING + 1) results.push(<Icon Component={HiDotsHorizontal}/>);

    for (let i = page - PAGES_PADDING; i <= page + PAGES_PADDING; i++) {
        if (i < 0) continue;
        if (i > totalPages - 1) break;
        results.push(<PageSelector active={page === i} page={i} setter={setter}/>)
    }

    if (page + PAGES_PADDING < totalPages - 2) results.push(<Icon Component={HiDotsHorizontal}/>);
    if (page + PAGES_PADDING < totalPages - 1) results.push(<PageSelector page={totalPages - 1} setter={setter}/>);

    results.push(
        <Arrow
            onClick={() => setter(page + 1)}
            Component={BsArrowRight}
            active={page < totalPages - 1}
        />
    );

    return (
        <>
            {results}
        </>
    );
};

export default PageNavigation;
