'use client';

interface LinkPageProps {
  page: {
    title: string;
    slug: string;
    bio: string | null;
    avatar_url: string | null;
    theme: string | null;
    links: any[];
    social_links: Record<string, string> | null;
  };
}

const themes: Record<string, { bg: string; text: string; btn: string; btnText: string }> = {
  dark: { bg: 'bg-[#0a0a0a]', text: 'text-white', btn: 'bg-white', btnText: 'text-black' },
  light: { bg: 'bg-white', text: 'text-black', btn: 'bg-black', btnText: 'text-white' },
  gradient: { bg: 'bg-gradient-to-br from-violet-600 to-purple-800', text: 'text-white', btn: 'bg-white/90', btnText: 'text-black' },
  neon: { bg: 'bg-[#0a0a0a]', text: 'text-green-400', btn: 'bg-green-500', btnText: 'text-black' },
  sunset: { bg: 'bg-gradient-to-br from-pink-500 to-rose-600', text: 'text-white', btn: 'bg-white/90', btnText: 'text-black' },
};

const socialIcons: Record<string, string> = {
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  tiktok: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z',
  youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
};

export default function LinkPageClient({ page }: LinkPageProps) {
  const theme = themes[page.theme || 'dark'] || themes.dark;
  const links = page.links || [];
  const social = page.social_links || {};

  const handleLinkClick = (url: string, index: number) => {
    // Track click (fire and forget)
    fetch(`/api/links/${page.slug}/click`, {
      method: 'POST',
      body: JSON.stringify({ index }),
    }).catch(() => {});
    window.open(url, '_blank');
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex items-start justify-center`}>
      <div className="w-full max-w-md mx-auto px-6 py-12">
        {/* Avatar */}
        <div className="text-center mb-8">
          {page.avatar_url ? (
            <img
              src={page.avatar_url}
              alt={page.title}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
          ) : (
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold ${theme.btn} ${theme.btnText}`}>
              {(page.title || '?')[0].toUpperCase()}
            </div>
          )}
          <h1 className={`text-xl font-bold ${theme.text}`}>{page.title}</h1>
          {page.bio && (
            <p className={`text-sm mt-2 opacity-70 ${theme.text}`}>{page.bio}</p>
          )}
        </div>

        {/* Social Icons */}
        {Object.keys(social).length > 0 && (
          <div className="flex justify-center gap-4 mb-8">
            {Object.entries(social).map(([platform, url]) => (
              <a
                key={platform}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.text} opacity-70 hover:opacity-100 transition-opacity`}
                style={{ backgroundColor: 'rgba(128,128,128,0.2)' }}
              >
                {socialIcons[platform.toLowerCase()] ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d={socialIcons[platform.toLowerCase()]} />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{platform[0].toUpperCase()}</span>
                )}
              </a>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="space-y-3">
          {links
            .filter((link: any) => link.isActive !== false)
            .map((link: any, index: number) => (
              <button
                key={index}
                onClick={() => handleLinkClick(link.url, index)}
                className={`w-full p-4 rounded-xl ${theme.btn} ${theme.btnText} font-medium text-center hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]`}
              >
                {link.title}
              </button>
            ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className={`text-xs opacity-30 ${theme.text}`}>
            Powered by Media Agency SaaS
          </p>
        </div>
      </div>
    </div>
  );
}
