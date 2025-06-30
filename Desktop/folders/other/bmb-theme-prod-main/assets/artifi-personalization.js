/**
 * Artifi Personalization Module
 * Handles product customization, bulk pricing, and cart integration
 */

(function() {
  'use strict';

  // ===== CONFIGURATION MODULE =====
  const Config = (function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      // API Configuration
      api: {
        storefrontToken: 'ff6e32cba592963d57044dd1c93a8877',
        graphqlEndpoint: '/api/2023-10/graphql.json',
        cartAddEndpoint: '/cart/add.js',
        cartEndpoint: '/cart.js'
      },
      
      // Artifi Configuration
      artifi: {
        webApiClientKey: urlParams.get('webApiClientKey') || "7553b364-fca5-4c72-bad7-4d96902c987f",
        websiteId: urlParams.get('websiteId') || "374",
        userId: urlParams.get('userId') || "12",
        isGuest: urlParams.get('isGuest') || "false",
        sku: urlParams.get('sku'),
        designId: urlParams.get('designId') || "",
        clientCode: urlParams.get('clientCode') || "",
        appMode: urlParams.get('appMode'),
        decorationMethod: urlParams.get('decorationMethod') || ""
      },
      
      // Product Configuration
      product: {
        variantId: urlParams.get('variant_id'),
        handle: urlParams.get('product_handle') || urlParams.get('handle'),
        imprintMethod: urlParams.get('imprint_method') || 'screen_print'
      },
      
      // Pricing Configuration
      pricing: {
        useBulkPricing: urlParams.get('bulk_pricing') !== 'false',
        volumeTiers: [
          { minQty: 50, price: 1.75 },
          { minQty: 25, price: 2.00 },
          { minQty: 10, price: 2.50 },
          { minQty: 1, price: 3.00 }
        ],
        imprintTiers: {
          'screen_print': [
            { min_qty: 1, upcharge: 0.15 },
            { min_qty: 50, upcharge: 0.12 },
            { min_qty: 100, upcharge: 0.10 }
          ],
          'embroidery': [
            { min_qty: 1, upcharge: 0.25 },
            { min_qty: 25, upcharge: 0.22 },
            { min_qty: 50, upcharge: 0.20 },
            { min_qty: 100, upcharge: 0.18 }
          ],
          'laser_engraving': [
            { min_qty: 1, upcharge: 0.35 },
            { min_qty: 25, upcharge: 0.30 },
            { min_qty: 50, upcharge: 0.25 },
            { min_qty: 100, upcharge: 0.20 }
          ]
        }
      },
      
      // Default Values
      defaults: {
        variantId: '49884783345968',
        imprintMethod: 'screen_print',
        basePrice: 3.00
      }
    };
  })();

  // ===== STATE MANAGEMENT =====
  const State = {
    currentProductData: null,
    currentBulkPricingData: null,
    modalSetup: false,
    isLoading: false
  };

  // ===== DOM UTILITIES =====
  const DOM = {
    get: (id) => document.getElementById(id),
    query: (selector) => document.querySelector(selector),
    queryAll: (selector) => document.querySelectorAll(selector),
    
    show: (element) => {
      if (element) element.style.display = 'block';
    },
    
    hide: (element) => {
      if (element) element.style.display = 'none';
    },
    
    addClass: (element, className) => {
      if (element) element.classList.add(className);
    },
    
    removeClass: (element, className) => {
      if (element) element.classList.remove(className);
    },
    
    toggleClass: (element, className) => {
      if (element) element.classList.toggle(className);
    }
  };

  // ===== ERROR HANDLER =====
  const ErrorHandler = {
    log: (context, error) => {
      console.error(`[${context}]`, error);
      console.error(`[${context}] Stack:`, error.stack);
    },
    
    show: (message) => {
      alert(message);
    },
    
    handle: (context, error, userMessage) => {
      ErrorHandler.log(context, error);
      ErrorHandler.show(userMessage || `Error: ${error.message}`);
    }
  };

  // ===== API MODULE =====
  const API = {
    async fetchProductData(productHandle) {
      if (!productHandle) {
        throw new Error('Product handle is required');
      }

      console.log('Fetching product data for:', productHandle);

      const query = `
        query getProductAndImprintMethods($handle: String!) {
          product(handle: $handle) {
            id
            title
            handle
            variants(first: 10) {
              nodes {
                id
                title
                price {
                  amount
                }
                sku
              }
            }
            metafields(identifiers: [
              {namespace: "custom", key: "price_breaks"},
              {namespace: "custom", key: "available_imprint_methods"}
            ]) {
              namespace
              key
              value
            }
          }
          metaobjects(type: "imprint_method", first: 20) {
            nodes {
              id
              handle
              methodName: field(key: "method_name") {
                value
              }
              upchargeTiers: field(key: "upcharge_tiers") {
                value
              }
              description: field(key: "description") {
                value
              }
              isActive: field(key: "is_active") {
                value
              }
            }
          }
        }
      `;

      try {
        const response = await fetch(Config.api.graphqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': Config.api.storefrontToken
          },
          body: JSON.stringify({
            query: query,
            variables: { handle: productHandle }
          })
        });

        if (!response.ok) {
          throw new Error(`GraphQL HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
          throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
        }

        if (!result.data || !result.data.product) {
          throw new Error(`Product not found for handle: ${productHandle}`);
        }

        return this.transformProductData(result.data);
      } catch (error) {
        ErrorHandler.handle('API.fetchProductData', error);
        throw error;
      }
    },

    transformProductData(data) {
      const productData = data.product;
      const transformed = {
        id: productData.id,
        title: productData.title,
        handle: productData.handle,
        variants: productData.variants.nodes,
        metafields: { custom: {} },
        imprintMethods: {}
      };

      // Process metafields
      if (productData.metafields && productData.metafields.length > 0) {
        productData.metafields.forEach(mf => {
          if (mf.key === 'price_breaks') {
            transformed.metafields.custom.bulk_pricing = mf.value;
          } else if (mf.key === 'available_imprint_methods') {
            transformed.metafields.custom.available_imprint_methods = mf.value;
          }
        });
      }

      // Process imprint methods
      if (data.metaobjects && data.metaobjects.nodes) {
        data.metaobjects.nodes.forEach(metaobject => {
          const methodKey = metaobject.handle ? metaobject.handle.replace(/-/g, '_').toLowerCase() : '';
          const methodName = metaobject.methodName?.value;
          const isActive = metaobject.isActive?.value === 'true' || metaobject.isActive?.value === true;
          
          let upchargeTiers = null;
          if (metaobject.upchargeTiers?.value) {
            try {
              const parsedTiers = JSON.parse(metaobject.upchargeTiers.value);
              upchargeTiers = parsedTiers.tiers || [];
            } catch (error) {
              console.error('Error parsing upcharge tiers:', error);
            }
          }

          if (methodKey && methodName && isActive && upchargeTiers && upchargeTiers.length > 0) {
            transformed.imprintMethods[methodKey] = {
              methodKey,
              methodName,
              upchargeTiers,
              description: metaobject.description?.value || '',
              isActive,
              handle: metaobject.handle
            };
          }
        });
      }

      return transformed;
    }
  };

  // ===== PRICING MODULE =====
  const Pricing = {
    calculateBulkPrice(quantity, bulkPricingData) {
      // Use metafield data if available
      if (bulkPricingData && bulkPricingData.breaks) {
        const applicableBreak = bulkPricingData.breaks
          .filter(breakItem => quantity >= breakItem.min_qty)
          .sort((a, b) => b.min_qty - a.min_qty)[0];
        
        const unitPrice = parseFloat(applicableBreak ? applicableBreak.price : bulkPricingData.breaks[0].price);
        const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
        
        return {
          unitPrice,
          totalPrice,
          appliedBreak: applicableBreak,
          quantity
        };
      }
      
      // Fallback to config pricing
      const tier = Config.pricing.volumeTiers.find(t => quantity >= t.minQty) || 
                   Config.pricing.volumeTiers[Config.pricing.volumeTiers.length - 1];
      
      return {
        unitPrice: tier.price,
        totalPrice: tier.price * quantity,
        appliedBreak: { min_qty: tier.minQty, price: tier.price },
        quantity
      };
    },

    calculateImprintUpcharge(imprintMethod, quantity, productData) {
      // Try metaobject data first
      if (productData && productData.imprintMethods) {
        const methodData = productData.imprintMethods[imprintMethod] || 
                          productData.imprintMethods[imprintMethod.replace('-', '_')] ||
                          productData.imprintMethods[imprintMethod.replace('_', '-')];
        
        if (methodData && methodData.upchargeTiers) {
          const applicableTier = methodData.upchargeTiers
            .filter(tier => quantity >= tier.min_qty)
            .sort((a, b) => b.min_qty - a.min_qty)[0];
          
          if (applicableTier) {
            return parseFloat(applicableTier.upcharge);
          }
        }
      }
      
      // Fallback to config pricing
      const methodTiers = Config.pricing.imprintTiers[imprintMethod] || 
                         Config.pricing.imprintTiers[Config.defaults.imprintMethod];
      
      const applicableTier = methodTiers
        .filter(tier => quantity >= tier.min_qty)
        .sort((a, b) => b.min_qty - a.min_qty)[0];
      
      return applicableTier ? applicableTier.upcharge : methodTiers[0].upcharge;
    },

    prepareCartData(artifiData, productData, quantity = 1) {
      let customizedProductData;
      try {
        customizedProductData = typeof artifiData === 'string' ? JSON.parse(artifiData) : artifiData;
      } catch (error) {
        customizedProductData = artifiData;
      }
      
      // Get bulk pricing data
      let bulkPricingData = null;
      if (productData.metafields && productData.metafields.custom && productData.metafields.custom.bulk_pricing) {
        try {
          bulkPricingData = typeof productData.metafields.custom.bulk_pricing === 'string' 
            ? JSON.parse(productData.metafields.custom.bulk_pricing)
            : productData.metafields.custom.bulk_pricing;
        } catch (error) {
          console.error('Error parsing bulk pricing data:', error);
        }
      }
      
      const pricingInfo = this.calculateBulkPrice(quantity, bulkPricingData);
      const imprintUpcharge = this.calculateImprintUpcharge(Config.product.imprintMethod, quantity, productData);
      const variantId = Utils.getShopifyVariantId();
      
      const cartData = {
        items: [{
          id: variantId,
          quantity: quantity,
          properties: {
            // Artifi customization data
            '_artifi_design_id': customizedProductData.designId || '',
            '_artifi_sku': customizedProductData.sku || '',
            '_artifi_customization_data': JSON.stringify(customizedProductData),
            '_artifi_preview_image': customizedProductData.previewImageUrl || '',
            '_customized': 'true',
            
            // Bulk pricing properties
            'bulk_pricing_applied': 'true',
            'price': pricingInfo.unitPrice.toFixed(2),
            'total_price': pricingInfo.totalPrice.toFixed(2),
            'quantity': quantity.toString(),
            'original': bulkPricingData && bulkPricingData.breaks ? bulkPricingData.breaks[0].price : Config.defaults.basePrice.toFixed(2),
            
            // Imprint method properties
            'method': Config.product.imprintMethod,
            'upcharge': imprintUpcharge.toFixed(2),
            
            // Final pricing
            'final_price': (pricingInfo.unitPrice + imprintUpcharge).toFixed(2),
            'final_total': ((pricingInfo.unitPrice + imprintUpcharge) * quantity).toFixed(2),
            
            // Metadata
            '_pricing_version': '2.0',
            '_function_target': 'purchase.cart-transform'
          }
        }]
      };
      
      return {
        cartData,
        pricingInfo,
        bulkPricingData,
        productData,
        artifiData: customizedProductData
      };
    }
  };

  // ===== CART MODULE =====
  const Cart = {
    async addToCart(cartData) {
      try {
        const response = await fetch(Config.api.cartAddEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cartData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Cart API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Successfully added to cart:', result);
        
        this.updateCartCount();
        return result;
      } catch (error) {
        ErrorHandler.handle('Cart.addToCart', error);
        throw error;
      }
    },

    async updateCartCount() {
      try {
        const response = await fetch(Config.api.cartEndpoint);
        const cart = await response.json();
        
        const cartCountElements = DOM.queryAll('.cart-count, [data-cart-count]');
        cartCountElements.forEach(element => {
          element.textContent = cart.item_count;
        });
      } catch (error) {
        console.error('Error updating cart count:', error);
      }
    }
  };

  // ===== UI MODULE =====
  const UI = {
    showLoadingState() {
      const addToCartBtn = DOM.get('AddToCart');
      if (addToCartBtn) {
        DOM.addClass(addToCartBtn, 'loading');
        addToCartBtn.disabled = true;
      }
    },

    hideLoadingState() {
      const addToCartBtn = DOM.get('AddToCart');
      if (addToCartBtn) {
        DOM.removeClass(addToCartBtn, 'loading');
        addToCartBtn.disabled = false;
      }
    },

    showPricingModal(productData) {
      const modal = DOM.get('bulkPricingModal');
      const quantityInput = DOM.get('quantityInput');
      
      quantityInput.value = 1;
      this.setupPricingTiers(productData);
      this.updateModalPricing(1);
      
      DOM.show(modal);
      
      if (!State.modalSetup) {
        this.setupModalEvents();
        State.modalSetup = true;
      }
    },

    setupPricingTiers(productData) {
      const pricingTiersContainer = DOM.get('pricingTiers');
      
      let bulkPricingData = null;
      if (productData.metafields && productData.metafields.custom && productData.metafields.custom.bulk_pricing) {
        try {
          bulkPricingData = typeof productData.metafields.custom.bulk_pricing === 'string' 
            ? JSON.parse(productData.metafields.custom.bulk_pricing)
            : productData.metafields.custom.bulk_pricing;
        } catch (error) {
          console.error('Error parsing bulk pricing data:', error);
        }
      }
      
      if (!bulkPricingData || !bulkPricingData.breaks) {
        pricingTiersContainer.innerHTML = '<p>No bulk pricing available</p>';
        return;
      }
      
      let tiersHTML = '';
      bulkPricingData.breaks.forEach(tier => {
        tiersHTML += `
          <div class="pricing-tier" data-min-qty="${tier.min_qty}">
            <span>${tier.min_qty}+ items</span>
            <span>$${parseFloat(tier.price).toFixed(2)} each</span>
          </div>
        `;
      });
      
      pricingTiersContainer.innerHTML = tiersHTML;
    },

    updateModalPricing(quantity) {
      if (!State.currentBulkPricingData) return;
      
      const { productData } = State.currentBulkPricingData;
      
      let bulkPricingData = null;
      if (productData.metafields && productData.metafields.custom && productData.metafields.custom.bulk_pricing) {
        try {
          bulkPricingData = typeof productData.metafields.custom.bulk_pricing === 'string' 
            ? JSON.parse(productData.metafields.custom.bulk_pricing)
            : productData.metafields.custom.bulk_pricing;
        } catch (error) {
          console.error('Error parsing bulk pricing data:', error);
        }
      }
      
      const pricingInfo = Pricing.calculateBulkPrice(quantity, bulkPricingData);
      
      const unitPriceElement = DOM.get('currentUnitPrice');
      const totalPriceElement = DOM.get('currentTotalPrice');
      const modalQuantityElement = DOM.get('modalQuantity');
      
      if (pricingInfo) {
        unitPriceElement.textContent = pricingInfo.unitPrice.toFixed(2);
        totalPriceElement.textContent = pricingInfo.totalPrice.toFixed(2);
      } else {
        unitPriceElement.textContent = '0.00';
        totalPriceElement.textContent = '0.00';
      }
      
      modalQuantityElement.textContent = quantity;
      
      // Highlight active pricing tier
      const pricingTiers = DOM.queryAll('.pricing-tier');
      let highestActiveTier = null;
      let highestMinQty = 0;
      
      pricingTiers.forEach(tier => {
        const minQty = parseInt(tier.getAttribute('data-min-qty'));
        DOM.removeClass(tier, 'active');
        
        if (quantity >= minQty && minQty > highestMinQty) {
          highestActiveTier = tier;
          highestMinQty = minQty;
        }
      });
      
      if (highestActiveTier) {
        DOM.addClass(highestActiveTier, 'active');
      }
    },

    setupModalEvents() {
      const modal = DOM.get('bulkPricingModal');
      const closeBtn = DOM.query('.bulk-pricing-close');
      const quantityInput = DOM.get('quantityInput');
      const decreaseBtn = DOM.get('decreaseQty');
      const increaseBtn = DOM.get('increaseQty');
      const confirmBtn = DOM.get('confirmAddToCart');
      
      closeBtn.onclick = () => DOM.hide(modal);
      
      window.onclick = (event) => {
        if (event.target === modal) {
          DOM.hide(modal);
        }
      };
      
      quantityInput.addEventListener('input', function() {
        const quantity = Math.max(1, parseInt(this.value) || 1);
        this.value = quantity;
        UI.updateModalPricing(quantity);
      });
      
      decreaseBtn.addEventListener('click', () => {
        const currentQty = parseInt(quantityInput.value) || 1;
        const newQty = Math.max(1, currentQty - 1);
        quantityInput.value = newQty;
        UI.updateModalPricing(newQty);
      });
      
      increaseBtn.addEventListener('click', () => {
        const currentQty = parseInt(quantityInput.value) || 1;
        const newQty = currentQty + 1;
        quantityInput.value = newQty;
        UI.updateModalPricing(newQty);
      });
      
      confirmBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value) || 1;
        UI.addToCartWithBulkPricing(quantity);
      });
    },

    async addToCartWithBulkPricing(quantity) {
      if (!State.currentBulkPricingData) {
        alert('Error: No product data available');
        return;
      }
      
      try {
        const { artifiData, productData } = State.currentBulkPricingData;
        const preparedData = Pricing.prepareCartData(artifiData, productData, quantity);
        
        const confirmBtn = DOM.get('confirmAddToCart');
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Adding to cart...';
        
        await Cart.addToCart(preparedData.cartData);
        
        // Hide modal and redirect to cart
        DOM.hide(DOM.get('bulkPricingModal'));
        
        // Show success message briefly before redirecting
        confirmBtn.textContent = 'Success! Redirecting to cart...';
        
        // Redirect to cart after a short delay
        setTimeout(() => {
          window.location.href = '/cart';
        }, 500);
        
      } catch (error) {
        ErrorHandler.handle('UI.addToCartWithBulkPricing', error, 'Error adding items to cart');
        
        // Reset button on error
        const confirmBtn = DOM.get('confirmAddToCart');
        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = `Add to Cart - <span id="modalQuantity">${quantity}</span> item(s)`;
        }
      }
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const Utils = {
    getShopifyVariantId() {
      // Priority 1: URL parameter
      if (Config.product.variantId) {
        return Config.product.variantId;
      }

      // Priority 2: Form input
      const variantInput = DOM.query('input[name="id"]');
      if (variantInput) {
        return variantInput.value;
      }

      // Priority 3: Data attribute
      const productElement = DOM.query('[data-variant-id]');
      if (productElement) {
        return productElement.getAttribute('data-variant-id');
      }

      // Fallback
      console.error('Could not determine Shopify variant ID - add ?variant_id=YOUR_ID to URL');
      return Config.defaults.variantId;
    },

    getProductHandle() {
      // Priority 1: URL parameter
      if (Config.product.handle) {
        return Config.product.handle;
      }
      
      // Priority 2: Parse from pathname
      const pathParts = window.location.pathname.split('/');
      const productsIndex = pathParts.indexOf('products');
      if (productsIndex !== -1 && pathParts[productsIndex + 1]) {
        return pathParts[productsIndex + 1];
      }
      
      // Priority 3: Data attribute
      const productElement = DOM.query('[data-product-handle]');
      if (productElement) {
        return productElement.getAttribute('data-product-handle');
      }
      
      // Priority 4: Derive from SKU
      if (Config.artifi.sku) {
        return Config.artifi.sku.toLowerCase();
      }
      
      console.warn('Could not determine product handle');
      return null;
    }
  };

  // ===== ARTIFI MODULE =====
  const ArtifiModule = {
    initialize() {
      window.Artifi.initialize({
        webApiClientKey: Config.artifi.webApiClientKey,
        websiteId: Config.artifi.websiteId,
        userId: Config.artifi.userId,
        isGuest: Config.artifi.isGuest,
        sku: Config.artifi.sku,
        designId: Config.artifi.designId,
        extraDetails: {
          clientCode: Config.artifi.clientCode
        },
        appMode: Config.artifi.appMode,
        decorationMethod: Config.artifi.decorationMethod
      });
      
      // Initialize first tab
      const firstTab = DOM.query(".tablinks");
      DOM.addClass(firstTab, "active");
      TabNavigation.openTab({ currentTarget: firstTab }, "artifi-upload-user-image-tab");
    },

    setupEventListeners() {
      // Artifi events
      window.addEventListener("artifi-initialized", (e) => {
        console.log("artifi-initialized", e.detail.data);
      });

      window.addEventListener("artifi-launching-error", (e) => {
        console.log("artifi-launching-error", e.detail.data);
      });

      window.addEventListener("artifi-design-updated", (e) => {
        console.log("artifi-design-updated", e.detail.data);
      });

      window.addEventListener("artifi-widget-added", (e) => {
        DOM.show(DOM.get("artifi-imprint-color-container"));
        DOM.hide(DOM.get("artifi-upload-container"));
        console.log("artifi-widget-added", e.detail.data);
      });

      window.addEventListener("artifi-widget-selected", this.handleWidgetEvent);
      window.addEventListener("artifi-widget-updated", this.handleWidgetEvent);

      window.addEventListener("artifi-widget-deselected", (e) => {
        console.log("artifi-widget-deselected", e.detail.data);
        
        const firstTab = DOM.query(".tablinks");
        DOM.addClass(firstTab, "active");
        
        const tabviews = DOM.queryAll(".tabview");
        tabviews.forEach(tabview => DOM.hide(tabview));
        
        DOM.show(DOM.get("artifi-upload-container"));
        DOM.show(DOM.get("artifi-upload-user-image-tab"));
        DOM.hide(DOM.get("artifi-imprint-color-container"));
        
        const textAreaBtn = DOM.get("text-area-btn");
        if (textAreaBtn) DOM.removeClass(textAreaBtn, "active");
        DOM.hide(DOM.get("edit-text-heading"));
      });

      // Add to cart events
      window.addEventListener("artifi-add-to-cart-initialize", (e) => {
        console.log("artifi-add-to-cart-initialize", e.detail.data);
        e.preventDefault();
        UI.showLoadingState();
        this.handleBulkPricingWorkflow(e.detail.data);
      });

      window.addEventListener("artifi-add-to-cart-success", (e) => {
        console.log("artifi-add-to-cart-success", e.detail.data);
        UI.hideLoadingState();
        this.handleArtifiCartSuccess(e.detail.data);
      });

      window.addEventListener("artifi-add-to-cart-error", (e) => {
        console.log("artifi-add-to-cart-error", e.detail.data.message);
        UI.hideLoadingState();
        alert('Error adding to cart: ' + e.detail.data.message);
      });
    },

    handleWidgetEvent(e) {
      console.log(e.type, e.detail.data);
      
      if (e?.detail?.data) {
        let parsedData;
        try {
          parsedData = JSON.parse(e.detail.data);
        } catch (error) {
          console.error("Invalid JSON data:", e.detail.data);
          parsedData = {};
        }
        
        if (parsedData?.type === "textbox") {
          TabNavigation.openTabOnWidgetSelect("artifi-text-area");
          const textAreaBtn = DOM.get("text-area-btn");
          if (textAreaBtn) DOM.addClass(textAreaBtn, "active");
        } else if (parsedData?.type === "image") {
          if (parsedData?.libProp?.ClipartId == null && parsedData?.libProp?.photoId == null) {
            return;
          }
          TabNavigation.openTabOnWidgetSelect("artifi-upload-user-image-tab");
          DOM.hide(DOM.get("artifi-upload-container"));
          DOM.show(DOM.get("artifi-imprint-color-container"));
          DOM.addClass(DOM.get("uploadTab"), "active");
        } else {
          TabNavigation.openTabOnWidgetSelect("artifi-upload-user-image-tab");
          DOM.show(DOM.get("artifi-upload-container"));
          DOM.hide(DOM.get("artifi-imprint-color-container"));
          DOM.addClass(DOM.get("uploadTab"), "active");
        }
      }
    },

    async handleBulkPricingWorkflow(artifiData) {
      try {
        console.log('Starting bulk pricing workflow...');
        
        const productHandle = Utils.getProductHandle();
        if (!productHandle) {
          throw new Error('Could not determine product handle');
        }
        
        const productData = await API.fetchProductData(productHandle);
        
        State.currentBulkPricingData = {
          artifiData: artifiData,
          productData: productData,
          productHandle: productHandle
        };
        
        UI.showPricingModal(productData);
        
      } catch (error) {
        ErrorHandler.handle('handleBulkPricingWorkflow', error, 'Unable to calculate bulk pricing');
      } finally {
        UI.hideLoadingState();
      }
    },

    handleArtifiCartSuccess(artifiData) {
      let customizedProductData;
      try {
        customizedProductData = typeof artifiData === 'string' ? JSON.parse(artifiData) : artifiData;
      } catch (error) {
        ErrorHandler.handle('handleArtifiCartSuccess', error, 'Error processing customized product data');
        return;
      }

      const shopifyCartData = {
        items: [{
          id: Utils.getShopifyVariantId(),
          quantity: 1,
          properties: {
            '_artifi_design_id': customizedProductData.designId || '',
            '_artifi_sku': customizedProductData.sku || '',
            '_artifi_customization_data': JSON.stringify(customizedProductData),
            '_artifi_preview_image': customizedProductData.previewImageUrl || '',
            '_customized': 'true'
          }
        }]
      };

      Cart.addToCart(shopifyCartData)
        .then(() => {
          alert('Customized product added to cart successfully!');
          Cart.updateCartCount();
        })
        .catch(error => {
          ErrorHandler.handle('handleArtifiCartSuccess', error, 'Error adding item to cart');
        });
    }
  };

  // ===== TAB NAVIGATION =====
  const TabNavigation = {
    openTab(evt, linkName) {
      window.Artifi.removeWidgetSelection();
      
      const tabviews = DOM.queryAll(".tabview");
      tabviews.forEach(tabview => DOM.hide(tabview));
      
      const tablinks = DOM.queryAll(".tablinks");
      tablinks.forEach(tablink => DOM.removeClass(tablink, "active"));
      
      DOM.show(DOM.get(linkName));
      DOM.addClass(evt.currentTarget, "active");
      
      const editTextHeading = DOM.get("edit-text-heading");
      if (editTextHeading) DOM.show(editTextHeading);
    },

    openTabOnWidgetSelect(linkName) {
      const tabviews = DOM.queryAll(".tabview");
      tabviews.forEach(tabview => DOM.hide(tabview));
      
      const tablinks = DOM.queryAll(".tablinks");
      tablinks.forEach(tablink => DOM.removeClass(tablink, "active"));
      
      DOM.show(DOM.get(linkName));
      
      const editTextHeading = DOM.get("edit-text-heading");
      if (editTextHeading) DOM.hide(editTextHeading);
    },

    setupTabEvents() {
      DOM.get("uploadTab").addEventListener("click", function(e) {
        DOM.show(DOM.get("artifi-upload-container"));
        DOM.hide(DOM.get("artifi-imprint-color-container"));
      });

      DOM.queryAll(".tablinks").forEach((button) => {
        button.addEventListener("click", () => {
          const event = new CustomEvent("tabClicked");
          window.dispatchEvent(event);
        });
      });
    }
  };

  // ===== MAIN ADD TO CART FUNCTION =====
  window.addToCartDesignHnd = function() {
    console.log('Add to cart button clicked');
    
    const variantId = Utils.getShopifyVariantId();
    if (!variantId) {
      alert('Please select a product variant before adding to cart.');
      return;
    }

    if (Config.pricing.useBulkPricing) {
      UI.showLoadingState();
      
      try {
        if (window.Artifi && window.Artifi.getDesignData) {
          const designData = window.Artifi.getDesignData();
          ArtifiModule.handleBulkPricingWorkflow(designData);
        } else {
          const fallbackData = {
            sku: Config.artifi.sku || 'UNKNOWN',
            designId: 'manual-' + Date.now(),
            previewImageUrl: ''
          };
          ArtifiModule.handleBulkPricingWorkflow(fallbackData);
        }
      } catch (error) {
        UI.hideLoadingState();
        ErrorHandler.handle('addToCartDesignHnd', error, 'Error getting design data');
      }
    } else {
      window.Artifi.addToCart();
    }
  };

  // ===== TAB NAVIGATION GLOBAL FUNCTIONS =====
  window.openIframe = TabNavigation.openTab;
  window.openIframeOnWidgetSelect = TabNavigation.openTabOnWidgetSelect;

  // ===== INITIALIZATION =====
  window.onload = function() {
    ArtifiModule.initialize();
    ArtifiModule.setupEventListeners();
    TabNavigation.setupTabEvents();
  };

})();