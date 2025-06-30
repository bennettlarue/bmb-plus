# BMB Enterprise Theme - Claude Code Documentation

## Overview
This is the Brand My Beverage (BMB) Enterprise Shopify theme built on Clean Canvas Enterprise v1.6.2. The theme includes a custom Artifi integration for product personalization with advanced bulk pricing functionality.

## Development Environment

### Required Commands
```bash
# Start theme development server
shopify theme dev --store=7qjcwn-1u.myshopify.com

# Git operations
git add .
git commit -m "Your commit message"
git push origin main
```

### Store Information
- Development Store: `7qjcwn-1u.myshopify.com`
- Production Store: `brandmybeverage.com`
- GitHub Repository: `https://github.com/bennettlarue/bmb-theme-prod.git`

## Key Custom Features

### Artifi Product Personalization
The theme includes a headless Artifi integration for custom product personalization located at `/pages/personalize`. This has been refactored from a monolithic 1763-line file into modular components:

**Core Files:**
- `templates/page.personalize.liquid` - Main template (106 lines, clean HTML)
- `assets/artifi-personalization.js` - Modular JavaScript functionality
- `assets/artifi-personalization.css` - Extracted styles
- `snippets/artifi-pricing-modal.liquid` - Bulk pricing modal component
- `templates/page.personalize-original.liquid` - Original backup file

**URL Structure:**
```
https://brandmybeverage.com/pages/personalize?sku=BMBG7005&variant_id=45788690776322&imprint_method=embroidery&product_handle=16-oz-mixing-glass
```

### Bulk Pricing System
Custom pricing logic supports:
- Tiered quantity discounts (12-23: 5%, 24-47: 10%, etc.)
- Imprint method upcharges (screen print, embroidery, laser engraving)
- Dynamic pricing calculation based on quantity and method

### JavaScript Architecture
The personalization system uses a modular approach:
- **Config**: API endpoints and configuration
- **State**: Application state management
- **API**: GraphQL and REST API interactions
- **Pricing**: Bulk pricing calculations
- **Cart**: Shopify cart integration
- **UI**: User interface management
- **ArtifiModule**: Artifi SDK integration

## Theme Structure

### Base Theme
- **Name**: Enterprise
- **Version**: 1.6.2
- **Author**: Clean Canvas
- **Documentation**: https://cleancanvas.co.uk/support/enterprise

### Key Directories
- `assets/` - CSS, JS, and media files
- `config/` - Theme settings and configuration
- `layout/` - Main theme layout files
- `sections/` - Reusable theme sections
- `snippets/` - Reusable code snippets
- `templates/` - Page templates
- `locales/` - Translation files

### Important Configuration
- Google Site Verification: `IdC5UWsvuPP4kpWuKMiASNElRiUSTni0TES80Yl8J5E`
- Microsoft Validation: `8F499F71B705F236D8C548783727E39C`
- Hotjar Tracking: ID `6443615`

## API Integration

### Shopify Storefront API
- Token: `ff6e32cba592963d57044dd1c93a8877`
- GraphQL Endpoint: `/api/2023-10/graphql.json`
- Used for product data fetching and variant information

### Artifi SDK
- Version: 3.0
- Layout: bretsky
- CDN: `https://component.artifi.net/artifi-headless-releases/3.0/Artifi.headless-layout-bretsky.js`

## Development Notes

### Personalization Page Considerations
- The Artifi integration is headless and standalone (not integrated with main theme layout)
- Maintains backward compatibility with existing URL parameters
- Custom bulk pricing logic is preserved and modular
- All original functionality maintained while improving code organization

### Recent Refactoring
- Reduced main personalization file from 1763 to 106 lines (94% reduction)
- Extracted 600+ lines of CSS to separate file
- Modularized 1000+ lines of JavaScript
- Created reusable pricing modal component

### Testing
Before deploying changes to personalization functionality:
1. Test URL parameter handling (sku, variant_id, imprint_method, product_handle)
2. Verify bulk pricing calculations for all quantity tiers
3. Test Artifi SDK integration and design upload
4. Confirm cart functionality and product addition

## Common Issues
- File modification errors: Ensure files are not open in IDE when making changes
- URL parameter preservation: Always test with full query string parameters
- Artifi SDK loading: Verify CDN availability and version compatibility

## Backup Files
- `templates/page.personalize-original.liquid` - Original monolithic file for reference