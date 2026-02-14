

'use client';

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function CalEmbed() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ "namespace": "30min" });
      cal("ui", { "cssVarsPerTheme": { "light": { "cal-brand": "#595858" }, "dark": { "cal-brand": "#a60808" } }, "hideEventTypeDetails": false, "layout": "month_view" });
    })();
  }, [])
  return <Cal namespace="30min"
    calLink="zaid-talxify/30min"
    style={{ width: "100%", height: "100%", overflow: "scroll" }}
    config={{ "layout": "month_view" }}
  />;
};
