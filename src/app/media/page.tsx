"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { IMAGE_GALLERY, VIDEO_GALLERY } from "@/lib/data/seed";

export default function MediaPage() {
  const [lightbox, setLightbox] = useState<typeof IMAGE_GALLERY[number] | null>(null);
  const [videoPlayer, setVideoPlayer] = useState<typeof VIDEO_GALLERY[number] | null>(null);
  const categories = ["all", ...Array.from(new Set(IMAGE_GALLERY.map(i => i.category)))];
  const videoCategories = ["all", ...Array.from(new Set(VIDEO_GALLERY.map(v => v.category)))];
  const [filter, setFilter] = useState("all");
  const [videoFilter, setVideoFilter] = useState("all");
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const heroRef = useRef<HTMLVideoElement>(null);

  const filteredImages = filter === "all" ? IMAGE_GALLERY : IMAGE_GALLERY.filter(i => i.category === filter);
  const filteredVideos = useMemo(() => videoFilter === "all" ? VIDEO_GALLERY : VIDEO_GALLERY.filter(v => v.category === videoFilter), [videoFilter]);

  const lightboxIndex = useMemo(() => lightbox ? filteredImages.findIndex(i => i.id === lightbox.id) : -1, [lightbox, filteredImages]);
  const videoPlayerIndex = useMemo(() => videoPlayer ? filteredVideos.findIndex(v => v.id === videoPlayer.id) : -1, [videoPlayer, filteredVideos]);

  const navigateLightbox = useCallback((dir: -1 | 1) => {
    if (lightboxIndex < 0) return;
    const next = lightboxIndex + dir;
    if (next >= 0 && next < filteredImages.length) setLightbox(filteredImages[next]);
  }, [lightboxIndex, filteredImages]);

  const navigateVideo = useCallback((dir: -1 | 1) => {
    if (videoPlayerIndex < 0) return;
    const next = videoPlayerIndex + dir;
    if (next >= 0 && next < filteredVideos.length) setVideoPlayer(filteredVideos[next]);
  }, [videoPlayerIndex, filteredVideos]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setLightbox(null); setVideoPlayer(null); }
      if (lightbox) {
        if (e.key === "ArrowLeft") navigateLightbox(-1);
        if (e.key === "ArrowRight") navigateLightbox(1);
      }
      if (videoPlayer) {
        if (e.key === "ArrowLeft") navigateVideo(-1);
        if (e.key === "ArrowRight") navigateVideo(1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, videoPlayer, navigateLightbox, navigateVideo]);

  // Featured video — first one
  const featuredVideo = VIDEO_GALLERY[0];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ═══ CINEMATIC HERO ═══ */}
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
          <video
            ref={heroRef}
            src={`/media/videos/${featuredVideo.file}`}
            muted
            autoPlay
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-[rgba(8,11,22,0.4)] to-[rgba(8,11,22,0.6)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--midnight)] via-transparent to-transparent opacity-60" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end px-8 pb-16 max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse" />
              <span className="font-mono text-xs tracking-[0.3em] uppercase text-[var(--gold)]">Media Gallery</span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[0.95] mb-4">
              THE LEGAL<br /><span className="text-[var(--gold)]">CHAIN.</span>
            </h1>
            <p className="text-xl text-[var(--text-primary)] max-w-2xl mb-8 leading-relaxed">
              Campaign media, advocacy assets, and visual documentation from every active case and operation.
            </p>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-[var(--gold)]">{VIDEO_GALLERY.length}</div>
                <div className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)]">Videos</div>
              </div>
              <div className="w-px bg-[rgba(201,168,76,0.2)]" />
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-[var(--gold)]">{IMAGE_GALLERY.length}</div>
                <div className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)]">Images</div>
              </div>
              <div className="w-px bg-[rgba(201,168,76,0.2)]" />
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-[var(--gold)]">{videoCategories.length - 1}</div>
                <div className="text-xs font-mono tracking-wider uppercase text-[var(--text-muted)]">Categories</div>
              </div>
            </div>
          </div>

          {/* Play featured button */}
          <button
            onClick={() => setVideoPlayer(featuredVideo)}
            className="absolute right-12 bottom-16 z-10 w-20 h-20 rounded-full bg-[rgba(201,168,76,0.15)] backdrop-blur-sm border-2 border-[var(--gold)] flex items-center justify-center cursor-pointer hover:bg-[rgba(201,168,76,0.3)] transition-all hover:scale-110 group"
          >
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" className="ml-1">
              <path d="M24 14L0 28V0L24 14Z" fill="var(--gold)" />
            </svg>
          </button>
        </section>

        <div className="max-w-[1400px] mx-auto px-8">
          {/* ═══ VIDEO GALLERY ═══ */}
          <section className="py-20">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Video Library</p>
                <h2 className="font-serif text-3xl md:text-4xl font-bold">
                  CASE <span className="text-[var(--gold)]">FOOTAGE.</span>
                </h2>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {videoCategories.map(cat => (
                  <button key={cat} onClick={() => setVideoFilter(cat)} className={`text-xs font-mono tracking-wider uppercase px-4 py-2 rounded border transition-all cursor-pointer ${
                    videoFilter === cat
                      ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)] shadow-[0_0_20px_rgba(201,168,76,0.2)]"
                      : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured (first two large) + grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {filteredVideos.slice(0, 2).map((vid) => (
                <VideoCard key={vid.id} vid={vid} size="large" onPlay={setVideoPlayer} hoveredVideo={hoveredVideo} setHoveredVideo={setHoveredVideo} />
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredVideos.slice(2).map((vid) => (
                <VideoCard key={vid.id} vid={vid} size="small" onPlay={setVideoPlayer} hoveredVideo={hoveredVideo} setHoveredVideo={setHoveredVideo} />
              ))}
            </div>
          </section>

          {/* ═══ IMAGE GALLERY ═══ */}
          <section className="pb-20">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="font-serif text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-2">Visual Assets</p>
                <h2 className="font-serif text-3xl md:text-4xl font-bold">
                  AI <span className="text-[var(--gold)]">IMAGERY.</span>
                </h2>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)} className={`text-xs font-mono tracking-wider uppercase px-4 py-2 rounded border transition-all cursor-pointer ${
                    filter === cat
                      ? "bg-[var(--gold)] text-[var(--midnight)] border-[var(--gold)] shadow-[0_0_20px_rgba(201,168,76,0.2)]"
                      : "bg-transparent text-[var(--text-muted)] border-[rgba(201,168,76,0.2)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((img) => (
                <button key={img.id} onClick={() => setLightbox(img)} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[rgba(201,168,76,0.08)] group cursor-pointer bg-transparent p-0 text-left transition-all hover:border-[var(--gold)] hover:shadow-[0_0_30px_rgba(201,168,76,0.1)]">
                  <Image src={img.file} alt={img.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="font-serif text-sm font-semibold text-white">{img.title}</span>
                    <span className="text-xs text-[var(--gold)] font-mono uppercase tracking-wider">{img.category}</span>
                  </div>
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[var(--gold)]" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ═══ IMAGE LIGHTBOX ═══ */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-8" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] text-white text-xl flex items-center justify-center bg-transparent border-none cursor-pointer hover:text-[var(--gold)] hover:bg-[rgba(201,168,76,0.1)] transition-all z-10">
            &times;
          </button>
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] text-white text-2xl flex items-center justify-center bg-transparent border border-[rgba(255,255,255,0.1)] cursor-pointer hover:text-[var(--gold)] hover:border-[var(--gold)] transition-all z-10">
              ‹
            </button>
          )}
          {lightboxIndex < filteredImages.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] text-white text-2xl flex items-center justify-center bg-transparent border border-[rgba(255,255,255,0.1)] cursor-pointer hover:text-[var(--gold)] hover:border-[var(--gold)] transition-all z-10">
              ›
            </button>
          )}
          <div className="relative max-w-[1000px] max-h-[80vh] w-full aspect-video" onClick={(e) => e.stopPropagation()}>
            <Image src={lightbox.file} alt={lightbox.title} fill className="object-contain rounded-lg" />
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="font-serif text-lg font-semibold text-white">{lightbox.title}</p>
            <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mt-1">{lightbox.category} &mdash; {lightboxIndex + 1} / {filteredImages.length}</p>
          </div>
        </div>
      )}

      {/* ═══ VIDEO PLAYER MODAL ═══ */}
      {videoPlayer && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center" onClick={() => setVideoPlayer(null)}>
          <button onClick={() => setVideoPlayer(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full text-white text-xl flex items-center justify-center bg-transparent border border-[rgba(255,255,255,0.1)] cursor-pointer hover:text-[var(--gold)] hover:border-[var(--gold)] transition-all z-10">
            &times;
          </button>
          {/* Prev/Next video */}
          {videoPlayerIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); navigateVideo(-1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full text-white text-2xl flex items-center justify-center bg-transparent border border-[rgba(255,255,255,0.1)] cursor-pointer hover:text-[var(--gold)] hover:border-[var(--gold)] transition-all z-10">
              ‹
            </button>
          )}
          {videoPlayerIndex < filteredVideos.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); navigateVideo(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full text-white text-2xl flex items-center justify-center bg-transparent border border-[rgba(255,255,255,0.1)] cursor-pointer hover:text-[var(--gold)] hover:border-[var(--gold)] transition-all z-10">
              ›
            </button>
          )}
          <div className="max-w-[1100px] w-full px-16" onClick={e => e.stopPropagation()}>
            <video
              key={videoPlayer.id}
              src={`/media/videos/${videoPlayer.file}`}
              controls
              autoPlay
              className="w-full rounded-lg shadow-[0_0_60px_rgba(201,168,76,0.1)]"
            />
            <div className="flex items-center justify-between mt-6">
              <div>
                <p className="font-serif text-xl font-semibold text-white">{videoPlayer.title}</p>
                <p className="text-xs text-[var(--gold)] font-mono uppercase tracking-[0.2em] mt-1">{videoPlayer.category}</p>
              </div>
              <p className="text-sm text-[var(--text-muted)] font-mono">{videoPlayerIndex + 1} / {filteredVideos.length}</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

/* ═══ VIDEO CARD COMPONENT ═══ */
function VideoCard({
  vid,
  size,
  onPlay,
  hoveredVideo,
  setHoveredVideo,
}: {
  vid: typeof VIDEO_GALLERY[number];
  size: "large" | "small";
  onPlay: (v: typeof VIDEO_GALLERY[number]) => void;
  hoveredVideo: string | null;
  setHoveredVideo: (id: string | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isHovered = hoveredVideo === vid.id;

  useEffect(() => {
    if (!videoRef.current) return;
    if (isHovered) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isHovered]);

  return (
    <button
      onClick={() => onPlay(vid)}
      onMouseEnter={() => setHoveredVideo(vid.id)}
      onMouseLeave={() => setHoveredVideo(null)}
      className={`relative overflow-hidden rounded-lg border border-[rgba(201,168,76,0.08)] group cursor-pointer bg-[var(--navy-card)] p-0 text-left transition-all hover:border-[var(--gold)] hover:shadow-[0_0_40px_rgba(201,168,76,0.12)] ${
        size === "large" ? "aspect-video" : "aspect-video"
      }`}
    >
      {/* Video preview on hover */}
      <video
        ref={videoRef}
        src={`/media/videos/${vid.file}`}
        muted
        loop
        playsInline
        preload="metadata"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isHovered ? "opacity-100" : "opacity-30"
        }`}
      />

      {/* Gradient overlay */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        isHovered
          ? "bg-gradient-to-t from-[rgba(8,11,22,0.85)] via-transparent to-transparent"
          : "bg-gradient-to-t from-[var(--midnight)] via-[rgba(8,11,22,0.7)] to-[rgba(8,11,22,0.5)]"
      }`} />

      {/* Play icon */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
        isHovered ? "opacity-100 scale-100" : "opacity-60 scale-90"
      }`}>
        <div className={`rounded-full bg-[rgba(201,168,76,0.15)] backdrop-blur-sm border border-[var(--gold)] flex items-center justify-center transition-all ${
          size === "large" ? "w-16 h-16" : "w-12 h-12"
        } ${isHovered ? "shadow-[0_0_30px_rgba(201,168,76,0.3)]" : ""}`}>
          <svg width={size === "large" ? "18" : "14"} height={size === "large" ? "20" : "16"} viewBox="0 0 18 20" fill="none" className="ml-0.5">
            <path d="M18 10L0 20V0L18 10Z" fill="var(--gold)" />
          </svg>
        </div>
      </div>

      {/* Title bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className={`font-serif font-bold text-white leading-tight ${size === "large" ? "text-lg" : "text-sm"}`}>{vid.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--gold)] bg-[rgba(201,168,76,0.1)] px-2 py-0.5 rounded">{vid.category}</span>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[var(--gold)]" />
      </div>
      <div className="absolute bottom-0 left-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[var(--gold)]" />
      </div>
    </button>
  );
}
