import { ShoppingCart } from 'lucide-react';
import clsx from 'clsx';

export default function OpenCart({
  className,
  quantity
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-400 text-neutral-700 hover:text-black transition-colors">
      <ShoppingCart
        className={clsx('h-4 w-4 transition-all ease-in-out hover:scale-110', className)}
      />

      {quantity ? (
        <div className="absolute right-0 top-0 -mr-2 -mt-2 h-4 w-4 rounded-sm bg-primary text-[11px] font-medium text-white">
          {quantity}
        </div>
      ) : null}
    </div>
  );
}
