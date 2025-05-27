"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MenuIcon, X, Search, ChevronDown } from "lucide-react";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useSWR from "swr";
import { searchContent, cleanContent } from "@/lib/api/wordpress";
import Logo from "./Logo";
import Icon from "./Icon";
import { ThemeSwitcher } from "./theme-switcher";

// Menü öğesi tipi
interface MenuItem {
  name: React.ReactNode;
  href: string;
  id: string;
  submenu?: {
    name: string;
    href: string;
  }[];
}

// Menü öğeleri yapısı
const menuItems: MenuItem[] = [
  { name: <Icon name="ev" size="xl" className="text-[var(--theme-primary)]" />, href: "/", id: "home" },
  { 
    name: "About", 
    href: "/about",
    id: "about",
    submenu: [
      { name: "The RSCN", href: "/about" },
      { name: "The Executive Board", href: "/about#executive-board" },
      { name: "Secretariat", href: "/about#secretariat" },
    ]
  },
  { name: "AHA Reference Sites", href: "/aha-reference", id: "aha-reference-sites" },
  { name: "Thematic Working Groups", href: "/thematic-working-groups", id: "thematic-working-groups" },
  { name: "Projects", href: "/projects", id: "projects" },
  { 
    name: "Resources", 
    href: "/resources",
    id: "resources",
    submenu: [
      { name: "Examples of Good Practice", href: "/good-practice" },
      { name: "Publications", href: "/publications" },
    ]
  },
  { 
    name: "Events & News", 
    href: "/events-news",
    id: "events-news",
    submenu: [
      { name: "Events", href: "/events" },
      { name: "News", href: "/news" },
    ]
  },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Arama işlevi
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchContent(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Arama sırasında bir hata oluştu:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Tüm menüler için bileşeni oluştur
  const renderFullMenu = () => (
    <div className="p-4 pt-0">
      <div className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <div key={item.id} className="border-b border-slate-100 pb-2">
            <h3 className="text-lg font-semibold mb-1 text-slate-800">
              <SheetClose asChild>
                <Link href={item.href} className="hover:text-[var(--theme-primary)] transition-colors flex items-center gap-2">
                  {item.name}
                </Link>
              </SheetClose>
            </h3>
            {item.submenu && (
              <ul className="space-y-1 pl-3 border-l-2 border-slate-200">
                {item.submenu.map((subitem) => (
                  <li key={subitem.name}>
                    <SheetClose asChild>
                      <Link 
                        href={subitem.href}
                        className="text-slate-600 hover:text-[var(--theme-primary)] transition-colors block py-0.5"
                      >
                        {subitem.name}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-md shadow-md text-white after:absolute after:inset-0 after:bg-gradient-to-b after:from-black/40 after:to-transparent after:-z-10" : "bg-transparent text-white"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-none">
        <Link href="/" className="flex items-center">
            <Logo width={140} height={48} />
        </Link>
        </div>

        {/* Desktop Menü */}
        <div className="hidden lg:flex items-center justify-center flex-1">
          <NavigationMenu className="text-white mx-auto">
            <NavigationMenuList className="flex flex-nowrap space-x-0.5">
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.id}>
                  {item.submenu ? (
                    <>
                      <NavigationMenuTrigger 
                        className="text-sm text-white bg-transparent hover:text-[var(--theme-primary)] data-[state=open]:bg-transparent data-[state=open]:text-[var(--theme-primary)] whitespace-nowrap px-2 py-1.5"
                      >
                        {item.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white rounded-lg">
                          {item.submenu.map((subitem) => (
                            <li key={subitem.name} className="row-span-1">
                              <NavigationMenuLink asChild>
                                <Link
                                  href={subitem.href}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 hover:text-[var(--theme-primary)] text-slate-800"
                                >
                                  <div className="text-sm font-medium leading-none">{subitem.name}</div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link 
                        href={item.href}
                        className="text-sm text-white bg-transparent hover:text-[var(--theme-primary)] px-2 py-1.5 transition-colors whitespace-nowrap"
                      >
                      {item.name}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Sağ taraftaki butonlar */}
        <div className="flex-none flex items-center space-x-1">
          {/* Desktop için butonlar */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Theme Switcher */}
            <ThemeSwitcher />
            
            {/* Tüm Menü Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 text-white hover:text-[var(--theme-primary)] hover:bg-transparent"
                >
                  <Icon name="menu" size="xl" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-4 w-[40%] overflow-y-auto">
                <SheetTitle className="sr-only">Menü</SheetTitle>
                <div className="mb-0">
                  <Logo width={120} height={40} className="mb-6" />
                  <h3 className="text-lg font-semibold text-gray-800">Tüm Menüler</h3>
                </div>
                {renderFullMenu()}
              </SheetContent>
            </Sheet>
            
            {/* Arama Dialog */}
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 text-white hover:text-[var(--theme-primary)] hover:bg-transparent"
                >
                  <Icon name="ara" size="xl" />
                  <span className="sr-only">Ara</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogTitle className="text-xl font-semibold mb-4">Sitede Ara</DialogTitle>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex">
                    <Input
                      placeholder="Arama terimi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" className="ml-2" disabled={isSearching}>
                      {isSearching ? "Aranıyor..." : "Ara"}
                    </Button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Sonuçlar</h3>
                      <ul className="space-y-2">
                        {searchResults.map((result) => (
                          <li key={result.id}>
                            <Link href={`/${result.type === 'post' ? 'posts' : 'pages'}/${result.slug}`} className="text-blue-600 hover:underline">
                              {result.title?.rendered || 'İsimsiz İçerik'}
                            </Link>
                            {result.excerpt?.rendered && (
                              <p className="text-sm text-slate-600">
                                {cleanContent(result.excerpt.rendered).slice(0, 100)}...
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {isSearching && (
                    <div className="text-center p-4">
                      <p>Aranıyor...</p>
                    </div>
                  )}
                  
                  {!isSearching && searchQuery && searchResults.length === 0 && (
                    <div className="text-center p-4">
                      <p>Sonuç bulunamadı.</p>
                    </div>
                  )}
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Mobil için butonlar */}
          <div className="flex items-center lg:hidden">
            {/* Theme Switcher */}
            <ThemeSwitcher />
            
            {/* Mobil Arama */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 text-white hover:text-[var(--theme-primary)] hover:bg-transparent"
              onClick={() => setIsSearchOpen(true)}
            >
              <Icon name="ara" size="xl" />
              <span className="sr-only">Ara</span>
            </Button>
            
          <Sheet>
            <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:text-[var(--theme-primary)] hover:bg-transparent"
                >
                  <Icon name="menu" size="xl" />
                <span className="sr-only">Menü</span>
              </Button>
            </SheetTrigger>
              <SheetContent side="right" className="p-4 w-[80%] sm:w-[40%] overflow-y-auto">
                <div className="mb-6">
                  <Logo width={120} height={40} className="mb-6" />
                  <h3 className="text-lg font-semibold text-gray-800">Menü</h3>
                </div>
                <div className="flex flex-col gap-4 py-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="py-1">
                      {item.submenu ? (
                        <details className="group">
                          <summary className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-lg font-medium hover:text-[var(--theme-primary)]">
                            {item.name}
                            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                          </summary>
                          <ul className="mt-1 space-y-1 px-4">
                            {item.submenu.map((subitem) => (
                              <li key={subitem.name}>
                                <SheetClose asChild>
                                  <Link
                                    href={subitem.href}
                                    className="block rounded-md px-2 py-2 text-base hover:text-[var(--theme-primary)] hover:bg-slate-100"
                                  >
                                    {subitem.name}
                                  </Link>
                                </SheetClose>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : (
                        <SheetClose asChild>
                  <Link 
                    href={item.href}
                            className="block rounded-md px-2 py-2 text-lg font-medium hover:text-[var(--theme-primary)] hover:bg-slate-100"
                  >
                    {item.name}
                  </Link>
                        </SheetClose>
                      )}
                    </div>
                ))}
                </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>
      
      {/* Mobil için arama dialogu */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle className="text-xl font-semibold mb-4">Sitede Ara</DialogTitle>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex">
              <Input
                placeholder="Arama terimi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="ml-2" disabled={isSearching}>
                {isSearching ? "Aranıyor..." : "Ara"}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Sonuçlar</h3>
                <ul className="space-y-2">
                  {searchResults.map((result) => (
                    <li key={result.id}>
                      <Link href={`/${result.type === 'post' ? 'posts' : 'pages'}/${result.slug}`} className="text-blue-600 hover:underline">
                        {result.title?.rendered || 'İsimsiz İçerik'}
                      </Link>
                      {result.excerpt?.rendered && (
                        <p className="text-sm text-slate-600">
                          {cleanContent(result.excerpt.rendered).slice(0, 100)}...
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {isSearching && (
              <div className="text-center p-4">
                <p>Aranıyor...</p>
              </div>
            )}
            
            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="text-center p-4">
                <p>Sonuç bulunamadı.</p>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </motion.header>
  );
} 