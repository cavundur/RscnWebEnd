import SocialMediaLinks from "@/components/SocialMediaLinks";

/**
 * Uygulama genelinde kullanılan Footer bileşeni
 * Kodun tamamı statiktir, sayfa özelinde prop almaz.
 */
const Footer = () => (
  <footer className="bg-[var(--blue-color-alt)] pt-16 relative">
    <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center items-start gap-16 relative">
      {/* Navigasyon, Legal ve Sosyal Medya kutusu aynı flex satırda */}
      <div className="flex-1 flex flex-col md:flex-row gap-8 md:gap-16 justify-center items-start md:items-center">
        <ul className="list-none p-0 m-0 space-y-2 text-base font-normal text-white">
          <li className="list-none"><a href="/about" className="hover:text-sky-300 transition-colors">About</a></li>
          <li className="list-none"><a href="/aha-reference" className="hover:text-sky-300 transition-colors">AHA Reference Sites</a></li>
          <li className="list-none"><a href="/thematic-working-groups" className="hover:text-sky-300 transition-colors">Thematic Working Groups</a></li>
          <li className="list-none"><a href="/projects" className="hover:text-sky-300 transition-colors">Projects</a></li>
          <li className="list-none"><a href="/events-news" className="hover:text-sky-300 transition-colors">Events & News</a></li>
        </ul>
        <ul className="list-none p-0 m-0 space-y-2 text-base font-normal text-white">
          <li className="list-none"><a href="/legal-notice" className="hover:text-sky-300 transition-colors">Legal Notice</a></li>
          <li className="list-none"><a href="/data-protection-policy" className="hover:text-sky-300 transition-colors">Data Protection Policy</a></li>
          <li className="list-none"><a href="/privacy-policy" className="hover:text-sky-300 transition-colors">Privacy Policy</a></li>
          <li className="list-none"><a href="/contact" className="hover:text-sky-300 transition-colors">Contact Us</a></li>
        </ul>
        {/* Sosyal Medya Kutusu - Artık flex içinde, absolute değil */}
        <div className="mt-8 md:mt-0 md:ml-8 flex-shrink-0">
          <div className="from-sky-400 to-blue-500 p-6 rounded-2xl shadow-lg flex flex-col gap-6 items-center">
            <SocialMediaLinks className="SocialMediaLinks" />
          </div>
        </div>
      </div>
    </div>
    {/* Alt siyah bar */}
    <div className="bg-black text-sky-200 text-center text-xs py-4 mt-12 tracking-wide">
      {/* Alt bilgi metni */}
      &copy; 2025 Reference Site Collaborative Network. All rights reserved.
    </div>
  </footer>
);

export default Footer; 