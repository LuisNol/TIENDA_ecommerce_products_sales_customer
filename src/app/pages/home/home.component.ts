import { Component, OnInit, afterRender } from '@angular/core';
import { HomeService } from './service/home.service';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalProductComponent } from '../guest-view/component/modal-product/modal-product.component';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from './service/cart.service';
import { ToastrService } from 'ngx-toastr';
import { SubscribeComponent } from '../subscribe/subscribe.component';
import { GoogleAnalyticsService } from '../../shared/google-analytics.service';

// Google Analytics

declare function SLIDER_PRINCIPAL([]): any;
declare var $: any;
declare function DATA_VALUES([]): any;
declare function PRODUCTS_CAROUSEL_HOME([]): any;
declare function MODAL_PRODUCT_DETAIL([]): any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    CommonModule,
    ModalProductComponent,
    SubscribeComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  SLIDERS: any = [];
  CATEGORIES_RANDOMS: any = [];
  TRADING_PRODUCT_NEW: any = [];
  TRADING_PRODUCT_FEATURE: any = [];
  TRADING_PRODUCT_TOP_SELLER: any = [];
  PRODUCTS_ELECTRONICS: any = [];
  PRODUCTS_CAROUSEL: any = [];

  BANNERS_SECUNDARIOS: any = [];
  BANNERS_PRODUCTS: any = [];

  LASTS_PRODUCT_DISCOUNT: any = [];
  LASTS_PRODUCT_FEATURE: any = [];
  LASTS_PRODUCT_SELLING: any = [];

  DISCOUNT_FLASH: any;
  DISCOUNT_FLASH_PRODUCTS: any = [];

  product_selected: any = null;
  variation_selected: any = null;
  currency: string = 'PEN';

  categories_selected: any[] = [];

  constructor(
    public homeService: HomeService,
    private cookieService: CookieService,
    public cartService: CartService,
    private toastr: ToastrService,
    private router: Router,
    private gaService: GoogleAnalyticsService
  ) {
    this.homeService.home().subscribe((resp: any) => {
      console.log(resp);
      this.SLIDERS = resp.sliders_principal;
      this.CATEGORIES_RANDOMS = resp.categories_randoms;
      this.TRADING_PRODUCT_NEW = resp.product_tranding_new.data;
      this.TRADING_PRODUCT_FEATURE = resp.product_tranding_featured.data;
      this.TRADING_PRODUCT_TOP_SELLER = resp.product_tranding_top_sellers.data;
      this.BANNERS_SECUNDARIOS = resp.sliders_secundario;
      this.PRODUCTS_ELECTRONICS = resp.product_electronics.data;
      this.PRODUCTS_CAROUSEL = resp.products_carusel.data;
      this.BANNERS_PRODUCTS = resp.sliders_products;

      this.LASTS_PRODUCT_DISCOUNT = resp.product_last_discounts.data;
      this.LASTS_PRODUCT_FEATURE = resp.product_last_featured.data;
      this.LASTS_PRODUCT_SELLING = resp.product_last_selling.data;

      this.DISCOUNT_FLASH = resp.discount_flash;
      this.DISCOUNT_FLASH_PRODUCTS = resp.discount_flash_products;
    });

    afterRender(() => {
      setTimeout(() => {
        SLIDER_PRINCIPAL($);
        DATA_VALUES($);
        PRODUCTS_CAROUSEL_HOME($);
        this.SLIDERS.forEach((SLIDER: any) => {
          this.getLabelSlider(SLIDER);
          this.getSubtitleSlider(SLIDER);
        });
        this.BANNERS_SECUNDARIOS.forEach((BANNER: any, index: number) => {
          if (index == 0) {
            this.getTitleBannerSecundario(BANNER, 'title-banner-s-' + BANNER.id);
          } else {
            this.getTitleBannerSecundario(BANNER, 'title-banner-sa-' + BANNER.id);
          }
        });
      }, 50);
    });
  }

  ngOnInit(): void {
    this.currency = this.cookieService.get("currency") || 'PEN';
    this.gaService.sendEvent('page_view', { page_path: '/home' });
  }

  goToCategory(category: any): void {
    this.router.navigate(['/productos-busqueda'], {
      queryParams: {
        categorias: category.id
      }
    });
  }

  addCategorie(categorie: any) {
    let INDEX = this.categories_selected.findIndex((item: any) => item == categorie.id);
    if (INDEX != -1) {
      this.categories_selected.splice(INDEX, 1);
    } else {
      this.categories_selected.push(categorie.id);
    }
    console.log(this.categories_selected);
    this.filterAdvanceProduct();
  }

  filterAdvanceProduct() {
    // Puedes definir o llamar tu filtro aquí (en home si quieres)
    // o mejor que filtre en el componente de búsqueda usando los query params
  }

  addCompareProduct(TRADING_PRODUCT: any) {
    let COMPARES = localStorage.getItem("compares") ? JSON.parse(localStorage.getItem("compares") ?? '') : [];

    let INDEX = COMPARES.findIndex((item: any) => item.id == TRADING_PRODUCT.id);
    if (INDEX != -1) {
      this.toastr.error("Validacion", "El producto ya existe en la lista");
      return;
    }
    COMPARES.push(TRADING_PRODUCT);
    this.toastr.success("Exito", "El producto se agrego a lista de comparacion");

    localStorage.setItem("compares", JSON.stringify(COMPARES));
    if (COMPARES.length > 1) {
      this.router.navigateByUrl("/compare-product");
    }
  }

  addCart(PRODUCT: any) {
    if (!this.cartService.authService.user) {
      this.toastr.error("Validacion", "Ingrese a la tienda");
      this.router.navigateByUrl("/login");
      return;
    }

    if (PRODUCT.variations.length > 0) {
      $("#producQuickViewModal").modal("show");
      this.openDetailProduct(PRODUCT);
      return;
    }

    let discount_g = PRODUCT.discount_g ?? null;

    let data = {
      product_id: PRODUCT.id,
      type_discount: discount_g?.type_discount ?? null,
      discount: discount_g?.discount ?? null,
      type_campaing: discount_g?.type_campaing ?? null,
      code_cupon: null,
      code_discount: discount_g?.code ?? null,
      product_variation_id: null,
      quantity: 1,
      price_unit: this.currency == 'PEN' ? PRODUCT.price_pen : PRODUCT.price_usd,
      subtotal: this.getTotalPriceProduct(PRODUCT),
      total: this.getTotalPriceProduct(PRODUCT) * 1,
      currency: this.currency,
    };

    this.cartService.registerCart(data).subscribe((resp: any) => {
      if (resp.message == 403) {
        this.toastr.error("Validacion", resp.message_text);
      } else {
        this.cartService.changeCart(resp.cart);
        this.toastr.success("Exitos", "El producto se agrego al carrito de compra");
      }
    }, err => {
      console.log(err);
    });
  }

  getLabelSlider(SLIDER: any) {
    var miDiv: any = document.getElementById('label-' + SLIDER.id);
    miDiv.innerHTML = SLIDER.label;
  }

  getSubtitleSlider(SLIDER: any) {
    var miDiv: any = document.getElementById('subtitle-' + SLIDER.id);
    miDiv.innerHTML = SLIDER.subtitle;
  }

  getTitleBannerSecundario(BANNER: any, ID_BANNER: string) {
    var miDiv: any = document.getElementById(ID_BANNER);
    miDiv.innerHTML = BANNER.title;
  }

  getNewTotal(PRODUCT: any, DISCOUNT_FLASH_P: any) {
    let price = this.currency == 'PEN' ? PRODUCT.price_pen : PRODUCT.price_usd;
    if (DISCOUNT_FLASH_P.type_discount == 1) {
      return (price - price * (DISCOUNT_FLASH_P.discount * 0.01)).toFixed(2);
    } else {
      return (price - DISCOUNT_FLASH_P.discount).toFixed(2);
    }
  }

  getTotalPriceProduct(PRODUCT: any) {
    if (PRODUCT.discount_g) {
      return this.getNewTotal(PRODUCT, PRODUCT.discount_g);
    }
    return this.currency == 'PEN' ? PRODUCT.price_pen : PRODUCT.price_usd;
  }

  getTotalCurrency(PRODUCT: any) {
    return this.currency == 'PEN' ? PRODUCT.price_pen : PRODUCT.price_usd;
  }

  openDetailProduct(PRODUCT: any, DISCOUNT_FLASH: any = null) {
    this.product_selected = null;
    this.variation_selected = null;
    setTimeout(() => {
      setTimeout(() => {
        if (DISCOUNT_FLASH) {
          this.product_selected.discount_g = DISCOUNT_FLASH;
        }
      }, 25);
      this.product_selected = PRODUCT;
    }, 50);
  }

  selectedVariation(variation: any) {
    this.variation_selected = null;
    setTimeout(() => {
      this.variation_selected = variation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }

  // Este es el método para trackBy usado en el *ngFor
  trackById(index: number, item: any): any {
    return item.id;
  }
}
