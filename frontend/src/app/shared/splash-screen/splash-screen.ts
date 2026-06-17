import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.html',
  styleUrls: ['./splash-screen.css']
})
export class SplashScreenComponent implements OnInit {
  @Output() splashComplete = new EventEmitter<void>();

  ngOnInit() {
    setTimeout(() => {
      this.splashComplete.emit();
    }, 2000);
  }
}
