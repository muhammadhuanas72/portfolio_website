import { useEffect, useState } from "react";
import { ContentContext, baseContent } from "./contentContext";
import { fetchRemote } from "./remote";
import { ScrollTrigger } from "./motion";

// Built-in content renders immediately; owner uploads from Supabase are merged in when they arrive.
export function ContentProvider({ children }) {
  const [content, setContent] = useState(baseContent);

  useEffect(() => {
    let alive = true;
    fetchRemote().then((remote) => {
      if (!alive || !remote) return;
      setContent({
        projects: [...baseContent.projects, ...remote.projects],
        resumes: baseContent.resumes.map((r) => remote.resumes.find((x) => x.slug === r.slug) ?? r),
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  // New sections change the page height; pinned and scrubbed triggers must re-measure.
  useEffect(() => {
    if (content !== baseContent) requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [content]);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
