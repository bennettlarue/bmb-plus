'use client';

import Form from 'next/form';
import { useSearchParams } from 'next/navigation';

export default function Search() {
  const searchParams = useSearchParams();

  return (
    <Form action="/search" className="relative w-full max-w-[617px]">
      <div className="relative">
        <input
          key={searchParams?.get('q')}
          type="text"
          name="q"
          placeholder="Search"
          autoComplete="off"
          defaultValue={searchParams?.get('q') || ''}
          className="w-full py-1 bg-[#eaeaea] rounded-[10px] pl-8 pr-4 text-[16px] text-[#5b5b5b] placeholder:text-[#5b5b5b] border-0 focus:outline-none focus:ring-0 font-barlow font-normal"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 20 20" 
            fill="none" 
            className="w-3 h-3 text-[#5b5b5b]"
          >
            <path 
              d="M8.5 16a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM15.5 15.5L19 19" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Form>
  );
}

export function SearchSkeleton() {
  return (
    <form className="relative w-full">
      <div className="relative">
        <input
          placeholder="Search"
          className="w-full h-[26px] bg-[#eaeaea] rounded-[10px] pl-8 pr-4 text-[16px] text-[#5b5b5b] placeholder:text-[#5b5b5b] border-0 focus:outline-none focus:ring-0 font-barlow font-normal"
          disabled
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 20 20" 
            fill="none" 
            className="w-3 h-3 text-[#5b5b5b]"
          >
            <path 
              d="M8.5 16a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM15.5 15.5L19 19" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </form>
  );
}
