"use client";

import Script from "next/script";

export default function ClarityAnalytics() {
  // Only load Clarity in production
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <Script
      id="clarity-analytics"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "tfuydfh16g");
        `,
      }}
    />
  );
}
