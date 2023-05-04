import { useEffect, useState } from "react";

export const useApiCall = <T,>(url: string, isJson: boolean = true) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error>();
    const [result, setResult] = useState<T>();
    const proxy = "https://corsproxy.io/?";

    useEffect(() => {
        setIsLoading(true);
        setError(undefined);

        const query = fetch(proxy + url)
            .then(res => {
                if (isJson) return res.json() as Promise<T>
                return res.text() as T;
            });

        query.then(res => setResult(res))
        query.then(_ => setIsLoading(false));

        query.catch(err => setError(err));
    }, [url]);

    return { isLoading, error, result };
};
