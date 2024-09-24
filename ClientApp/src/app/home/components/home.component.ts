import {Component, inject, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectQueryParam} from '../../shared/store/router.reducer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  store = inject(Store);
  returnUrl: string | null = null;
  returnUrl$ = this.store.select(selectQueryParam('returnUrl'));
  sub = this.returnUrl$.subscribe((p) => console.log(p));

  ngOnInit() {
    
  }
}
