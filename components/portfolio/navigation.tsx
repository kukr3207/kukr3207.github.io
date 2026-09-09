'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

const links = [
  { id: 'experience', label: 'Experience', href: '/#experience' },
  { id: 'projects', label: 'Deep dives', href: '/projects/' },
  { id: 'learning', label: 'Learning', href: '/learning/' },
  { id: 'about', label: 'About', href: '/#about' },
  { id: 'contact', label: 'Let’s talk', href: '/#contact' },
];

export function Navigation() {
  const pathname = usePathname();
  const [section, setSection] = useState('');
  const isHome = pathname === '/';
  const active = isHome
    ? section
    : pathname?.startsWith('/learning')
      ? 'learning'
      : pathname?.includes('verifier-design') ||
          pathname?.startsWith('/experience')
        ? 'experience'
        : pathname?.startsWith('/projects') || pathname?.includes('graph-rag')
          ? 'projects'
          : '';

  useEffect(() => {
    if (!isHome) return;
    let frame = 0;
    function update() {
      frame = 0;
      const header = document.querySelector('.site-header');
      const threshold = (header?.getBoundingClientRect().height ?? 100) + 64;
      const sections = [
        ...document.querySelectorAll<HTMLElement>(
          '#experience, #contracting, #learning, #about, #contact',
        ),
      ];
      const current = sections
        .filter((item) => item.getBoundingClientRect().top <= threshold)
        .at(-1);
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
      setSection(
        atBottom
          ? 'contact'
          : current?.id === 'contracting'
            ? 'experience'
            : (current?.id ?? ''),
      );
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [isHome]);

  return (
    <nav className="nav" aria-label="Main navigation">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.href}
          className={
            link.id === 'contact'
              ? 'contact-link'
              : link.id === 'about'
                ? 'optional-nav'
                : undefined
          }
          aria-current={
            active === link.id
              ? isHome || link.id === 'experience'
                ? 'location'
                : 'page'
              : undefined
          }
        >
          {link.label}
          {link.id === 'contact' && (
            <ArrowUpRight size={15} aria-hidden="true" />
          )}
        </a>
      ))}
    </nav>
  );
}
