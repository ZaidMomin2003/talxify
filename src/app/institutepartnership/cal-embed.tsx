
'use client';

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function CalEmbed() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({"namespace":"talxify-colab"});
      cal("ui", {"styles":{"branding":{"brandColor":"#3F51B5"}},"hideEventTypeDetails":false,"layout":"month_view"});
    })();
  }, [])
  return <Cal
    namespace="talxify-colab"
    calLink="zaid-momin-st0o8z/talxify-colab"
    style={{width:"100%",height:"100%",overflow:"scroll"}}
    config={{"layout":"month_view"}}
  />;
};
