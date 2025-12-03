import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Setiap kali URL (pathname) berubah, scroll window ke (0,0) / Atas
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}