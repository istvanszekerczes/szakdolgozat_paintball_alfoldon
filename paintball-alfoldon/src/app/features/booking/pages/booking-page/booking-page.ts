import { Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BookingWizard } from '../../components/booking-wizard/booking-wizard';

@Component({
  selector: 'app-booking-page',
  imports: [BookingWizard],
  templateUrl: './booking-page.html',
  styleUrl: './booking-page.scss',
})
export class BookingPage implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('Időpont foglalás – Paintball és lézertag | Paintball Alföldön');
    this.meta.updateTag({
      name: 'description',
      content:
        'Foglald le paintball vagy lézertag időpontodat. Válassz pályát és időpontot, és foglalj online pár perc alatt, vagy keress minket telefonon vagy e-mailben.',
    });
  }
}
