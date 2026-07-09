import { useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export function useHighlightItem(isLoading: boolean) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Get the ID from our new query parameter
  const highlightId = searchParams.get('highlight');

  useEffect(() => {
    // Wait until data finishes loading, and ensure we have an ID to highlight
    if (isLoading || !highlightId) return;

    // Small delay to ensure the DOM has fully rendered the SWR data
    const timeoutId = setTimeout(() => {
      const el = document.getElementById(highlightId);
      
      if (el) {
        // 1. Scroll it into view
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 2. Add the flash effect
        el.classList.add('ring-2', 'ring-primary', 'bg-primary/20', 'transition-all', 'duration-500');
        
        // 3. Remove the flash effect after 2 seconds
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-primary', 'bg-primary/20');
        }, 2000);

        // --- THIS FIXES THE GHOST FLASH BUG ---
        // We use the Next.js router to clear the query parameter from the URL
        // without reloading the page and without scrolling.
        // Now Next.js knows the URL is officially back to just '/tasks'.
        router.replace(pathname, { scroll: false });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
    
  // The effect will re-run anytime the loading state or the highlightId in the URL changes
  }, [isLoading, highlightId, pathname, router]); 
}