import { useState } from "react";
import { useDebounce } from "./use-debounce";

export function useDebouncedSearch(delayMs = 300) {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, delayMs);

    return { search, setSearch, debouncedSearch };
}
