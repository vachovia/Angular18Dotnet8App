import {Component, OnDestroy, OnInit} from '@angular/core';
import { PlayService } from '../services/play.service';
import {Subscription} from 'rxjs';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './play.component.html',
  styleUrl: './play.component.scss',
})
export class PlayComponent implements OnInit, OnDestroy {
  sub?: Subscription;
  message: string | undefined;

  constructor(private playService: PlayService) {}

  ngOnInit(): void {
    this.getPlayers();
  }

  getPlayers() {
    this.sub = this.playService.getPlayers().subscribe({
      next: (response: any) => (this.message = response.value.message),
      error: (error:any) => console.log(error),
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
