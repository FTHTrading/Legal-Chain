import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { IMAGE_GALLERY, VIDEO_GALLERY } from "@/lib/data/seed";

export const metadata = {
  title: "Media Gallery — UNYKORN // LAW",
  description: "Visual advocacy assets, campaign media, and legal documentation from the UNYKORN platform.",
};

export default function MediaPage() {
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
            <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-6">Images ({IMAGE_GALLERY.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {IMAGE_GALLERY.map((img) => (
                <div key={img.id} className="relative aspect-video overflow-hidden rounded-lg border border-[rgba(201,168,76,0.1)] card-lift group">
                  <Image src={img.file} alt={img.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="font-serif text-sm font-semibold">{img.title}</span>
                    <span className="text-xs text-[var(--text-muted)]">{img.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Video Gallery */}
          <section>
            <h2 className="font-serif text-xs tracking-[0.2em] uppercase text-[var(--gold)] mb-6">Videos ({VIDEO_GALLERY.length})</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {VIDEO_GALLERY.map((vid) => (
                <div key={vid.id} className="bg-[var(--navy-card)] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 card-lift">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded bg-[rgba(201,168,76,0.1)] flex items-center justify-center text-[var(--gold)]">
                      ▶
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-base font-bold mb-1">{vid.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span className="font-mono">{vid.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
