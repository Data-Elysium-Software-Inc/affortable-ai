import { useEffect, useRef, useState, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(isLoading = false): [RefObject<T>, RefObject<T>] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [atBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkIfAtBottom = () => {
      const atBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
      setIsAtBottom(atBottom);
    };

    
    container.addEventListener("scroll", checkIfAtBottom);

    checkIfAtBottom();

    return () => {
      container.removeEventListener("scroll", checkIfAtBottom);
    };
  }, []); 

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleUserScroll = () => {
      setIsAutoScroll(false);
    };

    container.addEventListener('wheel', handleUserScroll);

    return () => {
      container.removeEventListener('wheel', handleUserScroll);
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      setIsAutoScroll(true); 
    }
  }, [isLoading]);

  useEffect(() => {
    if (atBottom) {
      setIsAutoScroll(true); 
    }
  }, [atBottom]);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        if (isAutoScroll) {
          end.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, [isAutoScroll]); 

  return [containerRef, endRef];
}
