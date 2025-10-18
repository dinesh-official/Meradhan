import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const useMaxScrollPercent = (elementId: string) => {
    const pathName = usePathname();
    const [maxScroll, setMaxScroll] = useState(0);
    const maxScrollRef = useRef(0);

    useEffect(() => {
        const element = document.getElementById(elementId) as HTMLElement | null;
        if (!element) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = element;
            const scrollPercent =
                scrollHeight > clientHeight
                    ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
                    : 0;

            if (scrollPercent > maxScrollRef.current) {
                maxScrollRef.current = scrollPercent;
                setMaxScroll(scrollPercent);
                console.log(`📊 Max scroll reached: ${scrollPercent}%`);
            }
        };

        element.addEventListener("scroll", handleScroll, { passive: true });

        // Initial check
        handleScroll();

        return () => {
            element.removeEventListener("scroll", handleScroll);
        };
    }, [elementId]);

    useEffect(() => {

        const timeOut = setTimeout(() => {
            setMaxScroll(0);
            maxScrollRef.current = 0;
        }, 2000)

        return () => {
            clearTimeout(timeOut);
        }

    }, [pathName])


    return maxScroll;
};
