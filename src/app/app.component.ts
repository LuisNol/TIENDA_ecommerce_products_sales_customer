import { Component, OnInit, isDevMode, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { filter } from 'rxjs/operators';

declare var $: any;
declare function HOMEINIT([]): any;
declare let gtag: Function;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'ecommerce';

  constructor(private router: Router) {
    // Ejecutar jQuery y HOMEINIT después del render
    afterNextRender(() => {
      setTimeout(() => {
        HOMEINIT($);
      }, 50);
      $(window).on('load', function () {
        $('#loading').fadeOut(500);
      });
    });

    // Registrar vistas en Google Analytics
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      gtag('config', 'G-Q186NQWYXM', {
        page_path: event.urlAfterRedirects
      });
    });
  }

  ngOnInit() {
    if (!isDevMode()) {
      const script = document.createElement('script');
      script.innerHTML = `(function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:6412459,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`;
      document.head.appendChild(script);
    }
  }
}
