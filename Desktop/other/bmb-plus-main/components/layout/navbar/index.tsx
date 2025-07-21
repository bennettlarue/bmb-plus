'use client';

import CartModal from 'components/cart/modal';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import MobileMenu from './mobile-menu';
import EnhancedSearch from './enhanced-search';
import { SearchSkeleton } from './search';

interface NavItem {
  title: string;
  href: string;
}

const navigationItems: NavItem[] = [
  {
    title: 'Everyday Drinkware',
    href: '/collections/everyday-drinkware'
  },
  {
    title: 'Wine & Champagne',
    href: '/collections/wine-champagne'
  },
  {
    title: 'Beer & Spirits',
    href: '/collections/beer-spirits'
  },
  {
    title: 'Serveware & Accessories',
    href: '/collections/serveware-accessories'
  }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="relative bg-white w-full border-b border-black">
      <div className="max-w-[1536px] mx-auto px-4 lg:px-6">
        {/* Top Row: Logo, Search, Cart */}
        <div className="flex items-center justify-between h-[60px]">
          {/* Mobile Menu */}
          <div className="block flex-none md:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={[]} />
            </Suspense>
          </div>

          <div className='flex w-full max-w-[700px]'>
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" prefetch={true} className="flex items-center">
              <Image
                src="/brand-my-beverage-logo.png"
                alt="Brand My Beverage"
                width={220}
                height={36}
                className="h-[36px] w-[220px]"
                priority
              />
            </Link>
          </div>

          {/* Search */}
          <div className="hidden md:flex justify-center flex-grow mx-8">
            <div className="w-full max-w-[617px]">
              <Suspense fallback={<SearchSkeleton />}>
                <EnhancedSearch />
              </Suspense>
            </div>
          </div>
          </div>

          {/* Cart */}
          <div className="flex items-center">
            <CartModal />
          </div>
        </div>

        {/* Bottom Row: Navigation */}
        <div className="hidden md:flex items-center justify-start space-x-8 mb-2 ml-2 border-b w-fit">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`font-barlow font-medium text-[14px] p-2 transition-colors ${
                  isActive 
                    ? 'text-[#00205c]' 
                    : 'text-[#707070] hover:text-[#00205c]'
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
