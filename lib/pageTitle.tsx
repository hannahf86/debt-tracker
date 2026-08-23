import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Lets a page tell the mobile app bar what to call itself.
 *
 * Most titles come straight from the route, but the debt detail screen is
 * titled with the company name, which only the page knows once it has loaded.
 */
const PageTitleContext = createContext<{
  title: string | null;
  setTitle: (t: string | null) => void;
}>({ title: null, setTitle: () => {} });

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | null>(null);
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

/** Read the override the current page has set (used by the app bar). */
export function usePageTitleValue() {
  return useContext(PageTitleContext).title;
}

/** Set the app bar title for as long as this page is mounted. */
export function usePageTitle(title: string | null) {
  const { setTitle } = useContext(PageTitleContext);
  useEffect(() => {
    setTitle(title);
    return () => setTitle(null);
  }, [title, setTitle]);
}
