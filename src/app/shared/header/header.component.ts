import { Component, afterNextRender, afterRender } from '@angular/core';
import { HomeService } from '../../pages/home/service/home.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../pages/home/service/cart.service';
import { ToastrService } from 'ngx-toastr';

declare function CurrecyChange([]):any;
declare var $:any;
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule,RouterModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  categories_menus:any = [];
  currency:string = 'PEN';

  user:any;
  listCarts:any = [];
  totalCarts:number = 0;
  isLoading:boolean = false;
  searchT:string = '';
  constructor(
    public homeService: HomeService,
    public cookieService: CookieService,
    public cartService: CartService,
    private toastr: ToastrService,
  ) {
    afterNextRender(() => {
      this.homeService.menus().subscribe((resp:any) => {
        console.log(resp);
        this.categories_menus = resp.categories_menus;
      })
      this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'PEN';
      this.user = this.cartService.authService.user;
      
      if(this.user){
        this.cartService.listCart().subscribe((resp:any) => {
          console.log(resp);
          resp.carts.data.forEach((cart:any) => {
            if(cart.currency != this.currency){
              this.cookieService.set("currency",cart.currency);
              setTimeout(() => {
                window.location.reload();
              }, 25);
            }
            this.cartService.changeCart(cart)
          });
        })
      }
    })
    afterRender(() => {
      setTimeout(() => {
        this.isLoading = true;
        setTimeout(() => {
          CurrecyChange($);
        }, 50);
      }, 50);
    })
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log(this.user);
    this.cartService.currentDataCart$.subscribe((resp:any) => {
      // console.log(resp);
      this.listCarts = resp;
      this.totalCarts = this.listCarts.reduce((sum:number, item:any) => sum + item.total, 0);
    })
  }
  logout(){
    this.cartService.authService.logout();
    setTimeout(() => {
      window.location.reload()
    }, 50);
  }
  deleteCart(CART:any) {
    this.cartService.deleteCart(CART.id).subscribe((resp:any) => {
      this.toastr.info("Eliminación","Se elimino el producto "+CART.product.title + " del carrito de compra");
      this.cartService.removeCart(CART);
    })
  }

  getIconMenu(menu:any){
    var miDiv:any = document.getElementById('icon-'+menu.id);
    miDiv.innerHTML = menu.icon; 
    return '';
  }

  changeCurrency(val:string){
    if(this.user){
      this.cartService.deleteCartsAll().subscribe((resp:any) => {
        this.cookieService.set("currency",val);
        window.location.reload();
        console.log(resp);
      })
    }else{
      this.cookieService.set("currency",val);
      setTimeout(() => {
        window.location.reload();
      }, 25);
    }
  }

  searchProduct(){
    window.location.href = "/productos-busqueda?search="+this.searchT;
  }
}
