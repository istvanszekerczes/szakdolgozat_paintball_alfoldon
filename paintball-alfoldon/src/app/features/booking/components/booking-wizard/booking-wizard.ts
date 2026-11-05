import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  FieldTree,
  ValidationError,
  email,
  form,
  max,
  maxLength,
  min,
  pattern,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BookingService } from '../../services/booking-service';
import { BookingDraft, EMPTY_DRAFT, toRequest } from '../../models/booking';
import {
  MAX_DAYS_IN_ADVANCE,
  MIN_DAYS_IN_ADVANCE,
  NOTE_MAX_LENGTH,
  PHONE_DISPLAY,
  PHONE_HREF,
  PHONE_PATTERN,
  isoDateFromToday,
} from '../../utils/booking-rules';
import { BookingDone } from '../booking-done/booking-done';
import { ContactStep } from '../contact-step/contact-step';
import { GroupStep } from '../group-step/group-step';
import { SlotStep } from '../slot-step/slot-step';
import { SummaryStep } from '../summary-step/summary-step';
import { VenueStep } from '../venue-step/venue-step';

interface WizardStep {
  label: string;
  title: string;
}

export const STEPS: readonly WizardStep[] = [
  { label: 'Pálya', title: 'Melyik pályán játszanátok?' },
  { label: 'Időpont', title: 'Mikor jönnétek?' },
  { label: 'Létszám', title: 'Hányan lesztek?' },
  { label: 'Adatok', title: 'Kapcsolattartó adatai' },
  { label: 'Összegzés', title: 'Ellenőrizd és küldd el' },
];

/** Fields of the backend's `CreateBookingRequest`, mapped to the step that asks for them. */
const STEP_OF_FIELD: Record<string, number> = {
  venueSlug: 0,
  date: 1,
  startTime: 1,
  headcount: 2,
  note: 2,
  name: 3,
  email: 3,
  phone: 3,
};

/**
 * Online booking: venue → date and slot → group → contact → summary.
 *
 * One Signal Form holds the whole booking; each step validates only its own fields before the
 * visitor can move on, and the backend checks every rule again on submit.
 */
@Component({
  selector: 'app-booking-wizard',
  imports: [VenueStep, SlotStep, GroupStep, ContactStep, SummaryStep, BookingDone],
  templateUrl: './booking-wizard.html',
  styleUrl: './booking-wizard.scss',
})
export class BookingWizard {
  private readonly bookingService = inject(BookingService);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('stepHeading');
  private readonly doneHeading = viewChild<ElementRef<HTMLElement>>('doneHost');

  protected readonly steps = STEPS;
  protected readonly phone = PHONE_DISPLAY;
  protected readonly phoneHref = PHONE_HREF;
  protected readonly minDate = isoDateFromToday(MIN_DAYS_IN_ADVANCE);
  protected readonly maxDate = isoDateFromToday(MAX_DAYS_IN_ADVANCE);

  protected readonly step = signal(0);
  protected readonly sending = this.bookingService.sending;
  protected readonly done = this.bookingService.created;
  /** Refusal by a booking rule (422) or a slot taken meanwhile (409); shown on the date step. */
  protected readonly ruleError = signal<string | null>(null);
  /** The request never got an answer (offline, server down). */
  protected readonly sendFailed = signal(false);

  private readonly model = signal<BookingDraft>({ ...EMPTY_DRAFT });

  protected readonly venues = this.bookingService.venues;
  protected readonly venuesLoading = this.bookingService.venuesLoading;
  protected readonly venuesError = this.bookingService.venuesError;
  /**
   * Narrow views of the model. The availability request must depend on these, not on the whole
   * model, or every keystroke in a later step would fetch the slots again.
   */
  private readonly venueSlug = computed(() => this.model().venueSlug);
  private readonly date = computed(() => this.model().date);
  private readonly startTime = computed(() => this.model().startTime);
  protected readonly venue = computed(() => this.venues().find((v) => v.slug === this.venueSlug()));

  /** The picked date, once it is inside the bookable window; empty otherwise. */
  private readonly bookableDate = computed(() => {
    const date = this.date();
    return date && date >= this.minDate && date <= this.maxDate ? date : '';
  });

  protected readonly availability = this.bookingService.availability;
  protected readonly availabilityLoading = this.bookingService.availabilityLoading;
  protected readonly availabilityError = this.bookingService.availabilityError;

  protected readonly form: FieldTree<BookingDraft> = form(this.model, (p) => {
    required(p.venueSlug, { message: 'Válassz pályát.' });

    required(p.date, { message: 'Válassz dátumot.' });
    validate(p.date, ({ value }) => {
      const date = value();
      if (!date) return null;
      if (date < this.minDate) {
        return {
          kind: 'tooSoon',
          message: `Online legalább ${MIN_DAYS_IN_ADVANCE} nappal előre lehet foglalni. Rövidebb határidőre hívj minket telefonon.`,
        };
      }
      if (date > this.maxDate) return { kind: 'tooLate', message: 'Erre a dátumra még nem lehet foglalni.' };
      return null;
    });
    required(p.startTime, { message: 'Válassz időpontot.' });

    required(p.headcount, { message: 'Add meg a létszámot.' });
    validate(p.headcount, ({ value }) => {
      const count = value();
      return count !== null && !Number.isInteger(count)
        ? { kind: 'wholeNumber', message: 'A létszám egész szám legyen.' }
        : null;
    });
    min(p.headcount, () => this.venue()?.minHeadcount ?? 1, {
      message: () => `Ezen a pályán legalább ${this.venue()?.minHeadcount ?? 1} fő játszhat.`,
    });
    max(p.headcount, () => this.venue()?.maxHeadcount, {
      message: () => `Ezen a pályán legfeljebb ${this.venue()?.maxHeadcount} fő játszhat.`,
    });
    maxLength(p.note, NOTE_MAX_LENGTH, { message: `A megjegyzés legfeljebb ${NOTE_MAX_LENGTH} karakter.` });

    required(p.name, { message: 'Add meg a neved.' });
    validate(p.name, ({ value }) =>
      value() && !value().trim() ? { kind: 'blank', message: 'Add meg a neved.' } : null,
    );
    maxLength(p.name, 200, { message: 'Legfeljebb 200 karakter.' });
    required(p.email, { message: 'Add meg az e-mail címed.' });
    email(p.email, { message: 'Érvénytelen e-mail cím.' });
    required(p.phone, { message: 'Add meg a telefonszámod.' });
    pattern(p.phone, PHONE_PATTERN, { message: 'Érvénytelen telefonszám.' });
  });

  /** The fields each step must have valid before the visitor can go on. */
  private readonly stepFields: readonly (() => FieldTree<unknown>[])[] = [
    () => [this.form.venueSlug],
    () => [this.form.date, this.form.startTime],
    () => [this.form.headcount, this.form.note],
    () => [this.form.name, this.form.email, this.form.phone],
    () => [],
  ];

  constructor() {
    this.bookingService.clearCreated();
    this.bookingService.loadVenues();
    this.bookingService.watchAvailability(
      computed(() => ({ venueSlug: this.venueSlug(), date: this.bookableDate() })),
    );

    // A new venue or day invalidates the picked slot.
    effect(() => {
      this.venueSlug();
      this.date();
      untracked(() => {
        this.ruleError.set(null);
        if (this.model().startTime) this.form.startTime().reset('');
      });
    });

    // Picking a slot answers an earlier refusal, so its message must not stay on screen.
    effect(() => {
      if (this.startTime()) untracked(() => this.ruleError.set(null));
    });

    // `/foglalas?palya=szeged`: preselect the venue once the list has arrived.
    const wanted = this.route.snapshot.queryParamMap.get('palya');
    if (wanted) {
      const preselect = effect(() => {
        const list = this.venues();
        if (!list.length) return;
        untracked(() => {
          if (list.some((v) => v.slug === wanted)) this.pickVenue(wanted);
        });
        preselect.destroy();
      });
    }
  }

  protected pickVenue(slug: string): void {
    this.form.venueSlug().value.set(slug);
    this.goTo(1);
  }

  protected next(): void {
    const fields = this.stepFields[this.step()]();
    fields.forEach((field) => field().markAsTouched());
    if (fields.every((field) => field().valid())) this.goTo(this.step() + 1);
  }

  protected back(): void {
    this.goTo(this.step() - 1);
  }

  /** Only steps already reached can be jumped to from the progress bar or the summary. */
  protected goTo(index: number): void {
    if (index < 0 || index >= this.steps.length) return;
    this.step.set(index);
    afterNextRender(() => this.heading()?.nativeElement.focus(), { injector: this.injector });
  }

  protected async send(): Promise<void> {
    this.sendFailed.set(false);
    this.ruleError.set(null);
    await submit(this.form, async (field) => {
      try {
        await firstValueFrom(this.bookingService.createBooking(toRequest(this.model())));
        afterNextRender(() => this.doneHeading()?.nativeElement.querySelector('h2')?.focus(), {
          injector: this.injector,
        });
        return null;
      } catch (error) {
        return this.handleSendError(error, field);
      }
    });
  }

  protected startOver(): void {
    this.model.set({ ...EMPTY_DRAFT });
    this.form().reset();
    this.bookingService.clearCreated();
    this.goTo(0);
  }

  protected reloadVenues(): void {
    this.bookingService.loadVenues();
  }

  protected retryAvailability(): void {
    this.bookingService.reloadAvailability();
  }

  /** Maps the backend's ProblemDetail answers onto the wizard. */
  private handleSendError(error: unknown, field: FieldTree<BookingDraft>): ValidationError.WithOptionalFieldTree[] | null {
    if (!(error instanceof HttpErrorResponse) || error.status === 0 || error.status >= 500) {
      this.sendFailed.set(true);
      return null;
    }

    const detail: string = error.error?.detail ?? 'A foglalást nem sikerült elküldeni.';

    if (error.status === 400) {
      const fieldErrors: Record<string, string> = error.error?.errors ?? {};
      const names = Object.keys(fieldErrors).filter((name) => name in STEP_OF_FIELD);
      if (!names.length) {
        this.sendFailed.set(true);
        return null;
      }
      this.goTo(Math.min(...names.map((name) => STEP_OF_FIELD[name])));
      return names.map((name) => ({
        kind: 'server',
        message: fieldErrors[name],
        fieldTree: field[name as keyof BookingDraft] as FieldTree<unknown>,
      }));
    }

    if (error.status === 409) {
      // The slot was taken since the list was loaded: show fresh slots and let them pick again.
      this.form.startTime().reset('');
      this.bookingService.reloadAvailability();
    }
    this.ruleError.set(detail);
    this.goTo(1);
    return null;
  }
}
