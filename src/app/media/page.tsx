"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import { IMAGE_GALLERY, VIDEO_GALLERY } from "@/lib/data/seed";

export default function MediaPage() {
  const [lightbox, setLightbox] = useState<typeof IMAGE_GALLERY[number] | null>(null);
  const [videoPlayer, setVideoPlayer] = useState<typeof VIDEO_GALLERY[number] | null>(null);
  const categories = ["all", ...Array.from(new Set(IMAGE_GALLERY.map(i => i.category)))];
  const videoCategories = ["all", ...Array.from(new Set(VIDEO_GALLERY.map(v => v.category)))];
  const [filter, setFilter] = useState("all");
  const [videoFilter, setVideoFilter] = useState("all");

  const filteredImages = filter === "all" ? IMAGE_GALLERY : IMAGE_GALLERY.filter(i => i.category === filter);
  const filteredVideos = useMemo(() => videoFilter === "all" ? VIDEO_GALLERY : VIDEO_GALLERY.filter(v => v.category === videoFilter), [videoFilter]);

  const lightboxIndex = useMemo(() => lightbox ? filteredImages.findIndex(i => i.id === lightbox.id) : -1, [lightbox, filteredImages]);

  const navigateLightbox = useCallback((dir: -1 | 1) => {
    if (lightboxIndex < 0) return;
    const next = lightboxIndex + dir;
    if (next >= 0 && next < filteredImages.length) setLightbox(filteredImages[next]);
  }, [lightboxIndex, filteredImages]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[104px] pb-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-16">
            <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Media Gallery</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              THE LEGAL<br /><span className="text-[var(--gold)]">CHAIN.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl">
              Campaign media, advocacy assets, and visual documentation from every active case and operation.
            </p>
          </div>

          {/* Image Gallery */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)]">Images ({filteredImages.length})</h2>
              <div className="flex gap-2">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)} className={`text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded border transition-colors cursor-pointer ${
                    filter === cat
                      ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)]"
                      : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredImages.map((img) => (
                <button key={img.id} onClick={() => setLightbox(img)} className="relative aspect-video overflow-hidden rounded-lg border border-[rgba(201,168,76,0.1)] card-lift group cursor-pointer bg-transparent p-0 text-left">
                  <Image src={img.file} alt={img.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="font-serif text-sm font-semibold text-white">{img.title}</span>
                    <span className="text-xs text-[var(--text-muted)]">{img.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Video Gallery */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)]">Videos ({filteredVideos.length})</h2>
              <div className="flex gap-2">
                {videoCategories.map(cat => (
                  <button key={cat} onClick={() => setVideoFilter(cat)} className={`text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded border transition-colors cursor-pointer ${
                    videoFilter === cat
                      ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)]"
                      : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredVideos.map((vid) => (
                <button key={vid.id} onClick={() => setVideoPlayer(vid)} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 card-lift text-left cursor-pointer hover:border-[var(--gold)] transition-colors w-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded bg-[rgba(201,168,76,0.1)] flex items-center justify-center text-[var(--gold)] text-xl">
                      ▶
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-base font-bold mb-1">{vid.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span className="font-mono">{vid.category}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Lightbox Modal — Images */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white text-3xl bg-transparent border-none cursor-pointer hover:text-[var(--gold)] transition-colors z-10">
            &times;
          </button>
          {/* Prev */}
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }} className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-4xl bg-transparent border-none cursor-pointer hover:text-[var(--gold)] transition-colors z-10">
              ‹
            </button>
          )}
          {/* Next */}
          {lightboxIndex < filteredImages.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }} className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-4xl bg-transparent border-none cursor-pointer hover:text-[var(--gold)] transition-colors z-10">
              ›
            </button>
          )}
          <div className="relative max-w-[900px] max-h-[80vh] w-full aspect-video" onClick={(e) => e.stopPropagation()}>
            <Image src={lightbox.file} alt={lightbox.title} fill className="object-contain rounded-lg" />
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="font-serif text-lg font-semibold text-white">{lightbox.title}</p>
            <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">{lightbox.category} — {lightboxIndex + 1} / {filteredImages.length}</p>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {videoPlayer && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8" onClick={() => setVideoPlayer(null)}>
          <button onClick={() => setVideoPlayer(null)} className="absolute top-6 right-6 text-white text-3xl bg-transparent border-none cursor-pointer hover:text-[var(--gold)] transition-colors z-10">
            &times;
          </button>
          <div className="max-w-[960px] w-full" onClick={e => e.stopPropagation()}>
            <video
              src={`/media/videos/${videoPlayer.file}`}
              controls
              autoPlay
              className="w-full rounded-lg border border-[rgba(201,168,76,0.2)]"
            />
            <div className="text-center mt-4">
              <p className="font-serif text-lg font-semibold text-white">{videoPlayer.title}</p>
              <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">{videoPlayer.category}</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
