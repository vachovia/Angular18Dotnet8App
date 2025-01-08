import {Component, inject, OnInit, signal} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectQueryParam} from '../../shared/store/router.reducer';
signal

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
  // sub = this.returnUrl$.subscribe((p) => console.log(p));

  counter = signal(0);

  ngOnInit() {}

  increment() {
    this.counter.set(this.counter() + 1);
  }

  decrement() {
    this.counter.set(this.counter() - 1);
  }
}
