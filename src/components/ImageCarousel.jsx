"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import MenuImage from "./MenuImage";

function Gallery({ urls, alt }) {
  const { t } = useI18n();
  const track = useRef(null);
  const [index, setIndex] = useState(0);
  const select = (position) => {
    track.current?.children[position]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };
  return <div className="relative h-full w-full">
    <div ref={track} dir="ltr" className="flex h-full snap-x snap-mandatory overflow-x-auto" onScroll={(event) => {
      const element = event.currentTarget;
      setIndex(Math.round(element.scrollLeft / element.clientWidth));
    }}>
      {urls.length ? urls.map((url, position) => <MenuImage key={`${position}:${url}`} src={url} alt={`${alt} ${position + 1}/${urls.length}`} className="h-full w-full shrink-0 snap-start" />) : <MenuImage alt={alt} className="h-full w-full" />}
    </div>
    {urls.length > 1 && <div className="absolute bottom-3 start-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/50 px-2 py-1" dir="ltr">
      {urls.map((_, position) => <button key={position} type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-white" aria-label={`${t.galleryImage} ${position + 1}`} aria-current={index === position ? "true" : undefined} onClick={() => select(position)}>
        <span className={`h-2 w-2 rounded-full ${index === position ? "bg-white" : "bg-white/40"}`} />
      </button>)}
    </div>}
  </div>;
}

export default function ImageCarousel({ images = [], image, alt = "" }) {
  const urls = images.length ? images : image ? [image] : [];
  return <Gallery key={urls.join("|")} urls={urls} alt={alt} />;
}
