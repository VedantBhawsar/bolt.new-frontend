import { useEffect, useState } from "react";
import { WebContainer } from "@webcontainer/api";

export const useWebContainer = () => {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);

  useEffect(() => {
    async function init() {
      const wc = await WebContainer.boot();
      setWebcontainer(wc);
    }
    init();
  }, []);

  return webcontainer;
};
