package com.paintball.app.booking;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.paintball.app.car.Car;
import com.paintball.app.common.BookingRuleException;
import com.paintball.app.common.ConflictException;
import com.paintball.app.common.NotFoundException;
import com.paintball.app.config.AppProperties;
import com.paintball.app.customer.Customer;
import com.paintball.app.customer.CustomerRepository;
import com.paintball.app.schedule.CrewCapacity;
import com.paintball.app.schedule.ScheduleTestData;
import com.paintball.app.venue.Venue;
import com.paintball.app.venue.VenueBlock;
import com.paintball.app.venue.VenueBlockRepository;
import com.paintball.app.venue.VenueRepository;

class BookingServiceTest {

    private static final ZoneId BUDAPEST = ZoneId.of("Europe/Budapest");
    /** "Today" in every test: 2026-10-19. */
    private static final LocalDate TODAY = LocalDate.of(2026, 10, 19);

    private final BookingRepository bookingRepository = mock(BookingRepository.class);
    private final VenueRepository venueRepository = mock(VenueRepository.class);
    private final CustomerRepository customerRepository = mock(CustomerRepository.class);
    private final VenueBlockRepository venueBlockRepository = mock(VenueBlockRepository.class);
    private final CrewCapacity crewCapacity = mock(CrewCapacity.class);
    private final Car car = ScheduleTestData.car(1, "ABC-123", 5);
    private BookingService service;
    private Venue venue;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(TODAY.atTime(12, 0).atZone(BUDAPEST).toInstant(), BUDAPEST);
        AppProperties properties = new AppProperties(
                new AppProperties.Booking(7, 365, List.of(LocalTime.of(8, 0), LocalTime.of(10, 0)),
                        Duration.ofHours(2), "Europe/Budapest"),
                null, null);
        service = new BookingService(bookingRepository, venueRepository, customerRepository,
                venueBlockRepository, crewCapacity,
                new BookingRules(properties, clock), clock);

        venue = new Venue();
        venue.setSlug("szeged");
        venue.setName("Boszorkánysziget");
        venue.setMinHeadcount(10);
        venue.setMaxHeadcount(150);
        when(venueRepository.findBySlugForUpdate("szeged")).thenReturn(Optional.of(venue));
        when(customerRepository.findByEmailIgnoreCase(any())).thenReturn(Optional.empty());
        when(customerRepository.save(any())).thenAnswer(call -> call.getArgument(0));
        when(bookingRepository.save(any())).thenAnswer(call -> call.getArgument(0));
        when(crewCapacity.dayForUpdate(any())).thenReturn(new CrewCapacity.Day(List.of(), List.of(car)));
    }

    @Test
    void createsPendingBookingWithSlotEnd() {
        Booking booking = service.create(request(TODAY.plusDays(7), LocalTime.of(10, 0), 20));

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(booking.getEndTime()).isEqualTo(LocalTime.of(12, 0));
        assertThat(booking.getCustomer().getEmail()).isEqualTo("bela@example.com");
        assertThat(booking.getCreatedAt()).isEqualTo(Instant.parse("2026-10-19T10:00:00Z"));
    }

    @Test
    void rejectsBookingInsideOneWeek() {
        assertThatThrownBy(() -> service.create(request(TODAY.plusDays(6), LocalTime.of(10, 0), 20)))
                .isInstanceOf(BookingRuleException.class)
                .hasMessageContaining("7 nappal előre");
    }

    @Test
    void rejectsBookingTooFarAhead() {
        assertThatThrownBy(() -> service.create(request(TODAY.plusDays(366), LocalTime.of(10, 0), 20)))
                .isInstanceOf(BookingRuleException.class);
    }

    @Test
    void rejectsStartTimeOffTheHalfHourOrOutsideTheDay() {
        assertThatThrownBy(() -> service.create(request(TODAY.plusDays(10), LocalTime.of(9, 15), 20)))
                .isInstanceOf(BookingRuleException.class)
                .hasMessageContaining("időpont");
        assertThatThrownBy(() -> service.create(request(TODAY.plusDays(10), LocalTime.of(10, 30), 20)))
                .isInstanceOf(BookingRuleException.class);
    }

    @Test
    void acceptsHalfHourStartBetweenTheFixedSlots() {
        Booking booking = service.create(request(TODAY.plusDays(10), LocalTime.of(9, 30), 20));

        assertThat(booking.getEndTime()).isEqualTo(LocalTime.of(11, 30));
    }

    @Test
    void rejectsHeadcountOutsideVenueLimits() {
        assertThatThrownBy(() -> service.create(request(TODAY.plusDays(10), LocalTime.of(8, 0), 9)))
                .isInstanceOf(BookingRuleException.class);
        assertThatThrownBy(() -> service.create(request(TODAY.plusDays(10), LocalTime.of(8, 0), 151)))
                .isInstanceOf(BookingRuleException.class);
    }

    @Test
    void rejectsTimeOverlappingAnotherGameOnTheVenue() {
        Booking taken = ScheduleTestData.game(1, venue, TODAY.plusDays(10), "09:00", "11:00", BookingStatus.PENDING);
        when(crewCapacity.dayForUpdate(any())).thenReturn(new CrewCapacity.Day(List.of(taken), List.of(car)));

        assertThatThrownBy(() -> service.create(request(TODAY.plusDays(10), LocalTime.of(8, 0), 20)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("foglalt");
    }

    @Test
    void rejectsGameNoCarCanReach() {
        // The only car is busy at another venue at the same time.
        Venue other = ScheduleTestData.venue(9, "Tiszaliget", 135);
        Booking busy = ScheduleTestData.game(1, other, TODAY.plusDays(10), "08:00", "10:00", BookingStatus.PENDING);
        when(crewCapacity.dayForUpdate(any())).thenReturn(new CrewCapacity.Day(List.of(busy), List.of(car)));

        assertThatThrownBy(() -> service.create(request(TODAY.plusDays(10), LocalTime.of(8, 0), 20)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("csapatot");
    }

    @Test
    void rejectsSlotOnBlockedVenue() {
        when(venueBlockRepository.findOverlapping(eq(venue), any(), any())).thenReturn(List.of(new VenueBlock()));

        assertThatThrownBy(() -> service.create(request(TODAY.plusDays(10), LocalTime.of(8, 0), 20)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("zárva");
    }

    @Test
    void rejectsUnknownOrInactiveVenue() {
        venue.setActive(false);

        assertThatThrownBy(() -> service.create(request(TODAY.plusDays(10), LocalTime.of(8, 0), 20)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void reusesExistingCustomerAndUpdatesContactDetails() {
        Customer existing = new Customer();
        existing.setEmail("bela@example.com");
        existing.setName("Régi Név");
        existing.setPhone("+36 1 111 1111");
        when(customerRepository.findByEmailIgnoreCase("bela@example.com")).thenReturn(Optional.of(existing));

        Booking booking = service.create(request(TODAY.plusDays(10), LocalTime.of(8, 0), 20));

        assertThat(booking.getCustomer()).isSameAs(existing);
        assertThat(existing.getName()).isEqualTo("Kiss Béla");
        assertThat(existing.getPhone()).isEqualTo("+36 30 123 4567");
        assertThat(booking.getContactName()).isEqualTo("Kiss Béla");
        assertThat(booking.getContactPhone()).isEqualTo("+36 30 123 4567");
    }

    @Test
    void statusTransitions() {
        assertThat(BookingStatus.PENDING.canChangeTo(BookingStatus.ACCEPTED)).isTrue();
        assertThat(BookingStatus.PENDING.canChangeTo(BookingStatus.REJECTED)).isTrue();
        assertThat(BookingStatus.ACCEPTED.canChangeTo(BookingStatus.CANCELLED)).isTrue();
        assertThat(BookingStatus.ACCEPTED.canChangeTo(BookingStatus.REJECTED)).isFalse();
        assertThat(BookingStatus.REJECTED.canChangeTo(BookingStatus.ACCEPTED)).isFalse();
    }

    private static CreateBookingRequest request(LocalDate date, LocalTime start, int headcount) {
        return new CreateBookingRequest("szeged", date, start, headcount, "Kiss Béla", "Bela@Example.com",
                "+36 30 123 4567", "Születésnap");
    }
}
