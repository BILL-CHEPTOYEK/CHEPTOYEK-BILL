import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Put a new route at the top of the page.
 *
 * A real page load starts at the top; a client-side one keeps whatever scroll
 * offset the previous page had. So following a link from the bottom of a long
 * page - the note list, /architecture - landed on the next page already
 * scrolled past its own heading.
 *
 * Two cases are deliberately left alone:
 *   - Back and forward (`POP`), where the browser restores the offset the
 *     visitor left and overriding that is the more annoying bug.
 *   - Links with a hash, which are asking for a specific element rather than
 *     the top.
 *
 * Renders nothing. It sits inside the router because that is where the
 * location is.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP" || hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
}
