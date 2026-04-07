"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 h-[72px] z-50 flex items-center justify-center border-b border-[rgba(201,168,76,0.15)]"
      style={{ background: "rgba(8,11,22,0.95)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-[1200px] w-full px-8 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <svg className="w-[42px] h-[42px]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#c9a84c" strokeWidth="1.5"/>
            <circle cx="50" cy="50" r="43" fill="none" stroke="#c9a84c" strokeWidth="0.5" opacity="0.5"/>
            <text x="50" y="58" textAnchor="middle" fill="#c9a84c" fontFamily="serif" fontSize="32">&#9878;</text>
            <text x="50" y="22" textAnchor="middle" fill="#c9a84c" fontFamily="serif" fontSize="7" letterSpacing="2" fontWeight="600">UNYKORN</text>
            <text x="50" y="88" textAnchor="middle" fill="#c9a84c" fontFamily="serif" fontSize="6" letterSpacing="3">EST. MMXXVI</text>
          </svg>
          <div className="font-serif text-[1.35rem] font-bold tracking-[0.12em] uppercase">
            <span className="text-[var(--gold)]">Unykorn</span>{" "}
            <span className="text-[var(--text-primary)] font-normal tracking-[0.06em]">Law</span>
          </div>
        </Link>

        {/* Mobile toggle */}
        <button className="md:hidden text-[var(--gold)] text-2xl bg-transparent border-none" onClick={() => setOpen(!open)}>
          &#9776;
        </button>

        {/* Links */}
        <div className={`${open ? "flex" : "hidden"} md:flex flex-col md:flex-row fixed md:static top-[72px] left-0 right-0 md:top-auto bg-[var(--midnight)] md:bg-transparent p-8 md:p-0 gap-6 md:gap-8 items-center border-b md:border-none border-[rgba(201,168,76,0.15)]`}>
          <NavLink href="/">Home</NavLink>
          <NavLink href="/law">Cases</NavLink>
          <NavLink href="/ops">Operations</NavLink>
          <NavLink href="/intake">Intake</NavLink>
          <NavLink href="/media">Media</NavLink>
          <NavLink href="/#network">Network</NavLink>
          <Link href="/intake"
            className="font-serif text-[0.8rem] font-semibold tracking-[0.1em] uppercase px-5 py-2 rounded-sm bg-[var(--gold)] text-[var(--midnight)] hover:bg-[var(--gold-light)] transition-colors no-underline">
            Free Case Review
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="font-serif text-[0.85rem] font-medium text-[var(--text-muted)] tracking-[0.1em] uppercase hover:text-[var(--gold)] transition-colors no-underline relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-[var(--gold)] after:transition-[width] after:duration-300 hover:after:w-full">
      {children}
    </Link>
  );
}
