# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on port 8080
- `npm run build` - Create production build
- `npm run build:dev` - Create development build
- `npm run lint` - Run ESLint linter
- `npm run preview` - Preview production build locally

### Package Management
- `npm install` - Install dependencies (or use `bun install` for faster installs)

## Architecture & Structure

### Framework Stack
- **React 18.3.1** with TypeScript for UI
- **Vite 5.4.1** as build tool with SWC for fast compilation
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS 3.4.11** for styling with custom design system
- **React Router DOM v6** for client-side routing
- **TanStack Query** for server state management
- **React Hook Form + Zod** for form handling and validation

### Key Architecture Patterns

#### Component Organization & Structure
- `src/components/ui/` - Pre-built shadcn/ui components (40+ available, READ-ONLY)
- `src/components/common/` - Reusable components (20-100 lines each)
- `src/components/forms/` - Form-specific components
- `src/components/features/` - Feature-specific components
- `src/pages/` - Route-level page components
- `src/hooks/` - Custom React hooks including `use-mobile.tsx` and `use-toast.ts`
- `src/lib/utils.ts` - Utility functions with Tailwind class merging via `cn()` function
- `src/lib/types.ts` - Shared TypeScript types and interfaces
- `src/lib/constants.ts` - Application constants
- `src/lib/validations/` - Zod validation schemas

#### Critical Architecture Rules
- **Component Size Limit**: Never exceed 300 lines per component
- **Composition Over Complexity**: Build complex UI from smaller, focused components
- **Single Responsibility**: Each component should have one clear purpose
- **Extract Reusable Logic**: Use custom hooks instead of duplicating code
- **Service Layer Pattern**: No inline API calls in components - use service layer in `src/lib/`

#### Import Aliases (configured in vite.config.ts)
- `@/` maps to `./src/`
- `@/components` for components
- `@/lib` for utilities
- `@/hooks` for custom hooks

#### Routing Structure
Routes are defined in `src/App.tsx`. Add new routes above the catch-all `*` route:
```tsx
<Routes>
  <Route path="/" element={<Index />} />
  {/* ADD NEW ROUTES HERE */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Design System Integration

This project uses a sophisticated design system based on comprehensive instructions in `.github/instructions/` and `.cursor/rules/`. Key principles:

#### shadcn/ui Components
Over 40 pre-built components available in `src/components/ui/`:
- **Layout**: `card`, `separator`, `sheet`, `sidebar`, `tabs`, `accordion`
- **Forms**: `button`, `input`, `form`, `select`, `checkbox`, `radio-group`
- **Overlays**: `dialog`, `alert-dialog`, `drawer`, `popover`, `tooltip`
- **Data Display**: `table`, `badge`, `avatar`, `chart`, `carousel`

#### Styling Conventions & Quality Standards
- Use Tailwind classes following the project's design system
- Generous spacing: `py-16 lg:py-24` for sections
- Consistent rhythm: `space-y-4 lg:space-y-6` for content
- Mobile-first responsive design approach
- Premium, sophisticated visual hierarchy with purposeful color psychology
- **Accessibility**: Maintain WCAG 2.1 AA contrast ratios (4.5:1 minimum)
- **Never ship** without running `npm run lint` - must pass without errors
- **Industry-specific designs**: Adapt visual identity, emotional tone, and color psychology to target audience
- **Design Philosophy**: Create unique, custom-crafted interfaces that feel premium and engaging
- **Color Strategy**: Use colors intentionally to evoke the right emotions and enhance user experience

### Configuration Files

- `vite.config.ts` - Vite configuration with path aliases and port 8080
- `components.json` - shadcn/ui configuration with default style and slate base color
- `tailwind.config.ts` - Tailwind configuration with dark mode support
- `tsconfig.json` - TypeScript configuration with strict mode

### Environment Variables
⚠️ **Security**: This is a client-side application. Only use `VITE_` prefixed environment variables for public configuration. Never expose sensitive data like API secrets.

### Testing & Quality
- ESLint configured with React and TypeScript rules
- No test framework currently configured - determine testing approach from codebase if tests are needed

### Development Patterns & Best Practices

#### Code Organization
- Use TypeScript interfaces for type safety - define shared types in `src/lib/types.ts`
- Implement responsive design mobile-first
- Follow React Hook Form patterns with Zod validation for forms
- Use TanStack Query for API state management
- Import UI components from `@/components/ui/`
- Use the toast system via `use-toast` hook for notifications

#### Cursor Rules Integration
This project includes comprehensive Cursor rules in `.cursor/rules/` that auto-apply based on file context:
- **Core Rules** (`core.mdc`) - Always active architecture and quality rules
- **Component Rules** (`components.mdc`) - Auto-loads when editing `src/components/**`
- **Design Rules** (`design.mdc`) - Auto-loads when editing UI/styling files
- **Form Rules** (`forms.mdc`) - Auto-loads when editing form components
- **Hook Rules** (`hooks.mdc`) - Auto-loads when editing `src/hooks/**`
- **Service Rules** (`services.mdc`) - Auto-loads when editing `src/lib/**`

Reference with `@rule-name` in prompts (e.g., `@quality` for quality checklist)

## Icons - lucide-react

This project uses **lucide-react** for icons. **Do NOT guess icon names.** Always verify before using.

```tsx
import { IconName } from "lucide-react";
// Usage: <IconName className="h-4 w-4" />
```

### How to verify an icon exists
Before using any icon, verify it exists by checking the installed package:
```bash
# Search for an icon by keyword (e.g. "cart", "user", "bell")
ls node_modules/lucide-react/dist/esm/icons/ | grep -i "cart"
```
Icon filenames use kebab-case (`shopping-cart.js`), but imports use PascalCase (`ShoppingCart`).
Conversion: `shopping-cart` → `ShoppingCart`, `arrow-up-right` → `ArrowUpRight`

### Common mistakes to avoid
- `LayoutDashboard` exists, NOT ~~`Dashboard`~~
- `Settings` exists, NOT ~~`Gear`~~
- `Trash2` exists, NOT ~~`DeleteIcon`~~
- `Eye` / `EyeOff` exist, NOT ~~`Visibility`~~
- `LogIn` / `LogOut` exist, NOT ~~`Login`~~ / ~~`Logout`~~
- `MessageSquare` exists, NOT ~~`Chat`~~ or ~~`Comment`~~
- `Bell` exists, NOT ~~`Notification`~~
- `MapPin` exists, NOT ~~`Location`~~
- `Pencil` exists, NOT ~~`EditIcon`~~
- `TriangleAlert` exists, NOT ~~`Warning`~~
- `Loader2` is the spinner, NOT ~~`Spinner`~~
- `Send` exists, NOT ~~`PaperPlane`~~
- `ShoppingCart` exists, NOT ~~`Cart`~~
- `Smartphone` exists, NOT ~~`Mobile`~~

## Payment Infrastructure

Built-in payment system supporting multiple Iranian and international gateways.

### Available Gateways

| Gateway | ID | Type | Currency |
|---------|-----|------|----------|
| زیبال | `zibal` | Iranian | IRR |
| زرین‌پال | `zarinpal` | Iranian | IRR |
| آیدی‌پی | `idpay` | Iranian | IRR |
| پی‌استار | `paystar` | Iranian | IRR |
| نکست‌پی | `nextpay` | Iranian | IRR |
| OxaPay | `oxapay` | International (Crypto) | USD |
| Stripe | `stripe` | International | USD |

### Quick Start - Simple Payment Button

```tsx
import { PaymentButton } from '@/components/payment';

function ProductPage() {
  return (
    <PaymentButton
      gateway="zibal"
      amount={500000}  // 50,000 تومان (in Rials)
      description="خرید محصول"
      orderId="order-123"
      onError={(error) => console.error(error)}
    />
  );
}
```

### Payment Card with Gateway Selection

```tsx
import { PaymentCard } from '@/components/payment';

function CheckoutPage() {
  return (
    <PaymentCard
      defaultGateway="zibal"
      gatewayType="iranian"  // or "international" or "all"
      description="پرداخت سفارش"
      orderId="order-456"
      onPaymentCreated={(response) => {
        console.log('Redirecting to:', response.data?.payment_url);
      }}
    />
  );
}
```

### Using Hooks Directly

```tsx
import { usePayment } from '@/hooks/use-payment';

function CustomPayment() {
  const { createPayment, isLoading, error } = usePayment({
    gateway: 'zarinpal',
    autoRedirect: true,
  });

  const handlePay = async () => {
    await createPayment({
      amount: 100000, // 10,000 تومان
      description: 'پرداخت سفارشی',
    });
  };

  return (
    <button onClick={handlePay} disabled={isLoading}>
      پرداخت
    </button>
  );
}
```

### Payment Callback Handling

The callback page is already configured at `/payment/callback`. After payment:

```tsx
import { usePaymentVerify } from '@/hooks/use-payment-verify';

function MyCallbackPage() {
  const { isVerifying, isSuccess, data, error } = usePaymentVerify({
    gateway: 'zibal',
    autoVerify: true,  // Automatically verifies from URL params
    onSuccess: (data) => {
      console.log('Payment verified!', data);
    },
  });

  if (isVerifying) return <div>در حال بررسی...</div>;
  if (isSuccess) return <div>پرداخت موفق! کد پیگیری: {data?.refNumber}</div>;
  return <div>پرداخت ناموفق</div>;
}
```

### File Structure

```
src/
├── lib/payment/
│   ├── index.ts      # Main exports
│   ├── types.ts      # TypeScript types
│   ├── gateways.ts   # Gateway configurations
│   └── service.ts    # API service layer
├── components/payment/
│   ├── PaymentButton.tsx   # Simple pay button
│   ├── PaymentCard.tsx     # Full payment form
│   ├── PaymentStatus.tsx   # Status display
│   └── PaymentCallback.tsx # Callback handler
├── hooks/
│   ├── use-payment.ts        # Payment creation hook
│   └── use-payment-verify.ts # Verification hook
└── pages/payment/
    └── callback.tsx          # Callback page
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co/functions/v1/proxy/PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Amount Conversion

- Iranian gateways use **Rials** (not Tomans)
- Use `tomansToRials(10000)` → `100000` Rials
- Use `rialsToTomans(100000)` → `10000` Tomans
- Use `formatAmount(100000, 'IRR')` → `"۱۰,۰۰۰ تومان"`