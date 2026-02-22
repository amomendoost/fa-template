// CartDrawer - slide-in cart drawer
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProductImageUrl } from '@/lib/shop/images';
import { useCart } from '@/hooks/use-cart';
import { PriceTag } from './PriceTag';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout?: () => void;
  className?: string;
}

export function CartDrawer({ open, onClose, onCheckout, className }: CartDrawerProps) {
  const { items, count, total, currency, updateQuantity, removeItem, clear } = useCart();

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" className={cn('flex flex-col w-full sm:max-w-md', className)} dir="rtl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            سبد خرید
            {count > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({count} مورد)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <ShoppingBag className="h-12 w-12" />
            <p>سبد خرید شما خالی است</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-3 py-2">
            {items.map((item) => {
              const key = `${item.product.id}-${item.variant || ''}`;
              const image = getProductImageUrl(item.product.images?.[0]);
              return (
                <div key={key} className="flex gap-3">
                  <div className="w-16 h-16 bg-muted rounded-md overflow-hidden shrink-0">
                    {image ? (
                      <img
                        src={image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        -
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground">{item.variant}</p>
                    )}
                    <PriceTag
                      price={item.product.price}
                      currency={item.product.currency}
                      className="text-sm mt-0.5"
                    />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeItem(item.product.id, item.variant)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-7 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {items.length > 0 && (
          <SheetFooter className="flex-col gap-3 sm:flex-col">
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-medium">جمع کل:</span>
              <PriceTag price={total} currency={currency} className="text-lg" />
            </div>
            <Button className="w-full" onClick={onCheckout}>
              ادامه خرید و پرداخت
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={clear}>
              پاک کردن سبد
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;
