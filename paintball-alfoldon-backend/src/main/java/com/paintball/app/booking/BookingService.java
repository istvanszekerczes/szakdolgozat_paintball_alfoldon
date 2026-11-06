package com.paintball.app.booking;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.paintball.app.common.ConflictException;
import com.paintball.app.common.NotFoundException;
import com.paintball.app.customer.Customer;
import com.paintball.app.customer.CustomerRepository;
import com.paintball.app.schedule.CrewCapacity;
import com.paintball.app.venue.Venue;
import com.paintball.app.venue.VenueBlockRepository;
import com.paintball.app.venue.VenueRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VenueRepository venueRepository;
    private final CustomerRepository customerRepository;
    private final VenueBlockRepository venueBlockRepository;
    private final CrewCapacity crewCapacity;
    private final BookingRules rules;
    private final Clock clock;

    public BookingService(BookingRepository bookingRepository, VenueRepository venueRepository,
            CustomerRepository customerRepository, VenueBlockRepository venueBlockRepository,
            CrewCapacity crewCapacity, BookingRules rules, Clock clock) {
        this.bookingRepository = bookingRepository;
        this.venueRepository = venueRepository;
        this.customerRepository = customerRepository;
        this.venueBlockRepository = venueBlockRepository;
        this.crewCapacity = crewCapacity;
        this.rules = rules;
        this.clock = clock;
    }

    /** Creates a pending booking; an admin accepts or rejects it later. */
    @Transactional
    public Booking create(CreateBookingRequest request) {
        Venue venue = venueRepository.findBySlugForUpdate(request.venueSlug())
                .filter(Venue::isActive)
                .orElseThrow(() -> new NotFoundException("Nincs ilyen pálya: " + request.venueSlug()));

        rules.checkDate(request.date());
        rules.checkSlot(request.startTime());
        rules.checkHeadcount(venue, request.headcount());
        LocalTime end = rules.slotEnd(request.startTime());
        CrewCapacity.Day day = crewCapacity.dayForUpdate(request.date());
        if (day.venueBusy(venue, request.startTime(), end)) {
            throw new ConflictException("Ez az időpont már foglalt, kérjük válassz másikat.");
        }
        if (!venueBlockRepository.findOverlapping(venue, request.date().atTime(request.startTime()),
                request.date().atTime(end)).isEmpty()) {
            throw new ConflictException("A pálya ebben az időpontban zárva van, kérjük válassz másikat.");
        }
        // No overbooking: every game of the day, this one included, must fit into the cars' days.
        if (day.planWith(venue, request.date(), request.startTime(), end).isEmpty()) {
            throw new ConflictException(
                    "Erre az időpontra már nem tudunk csapatot küldeni, kérjük válassz másikat.");
        }

        Instant now = Instant.now(clock);
        Booking booking = new Booking();
        booking.setVenue(venue);
        booking.setCustomer(findOrCreateCustomer(request, now));
        booking.setContactName(request.name().trim());
        booking.setContactPhone(request.phone().trim());
        booking.setPlayDate(request.date());
        booking.setStartTime(request.startTime());
        booking.setEndTime(end);
        booking.setHeadcount(request.headcount());
        booking.setNote(blankToNull(request.note()));
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(now);
        booking.setUpdatedAt(now);
        Booking saved = bookingRepository.save(booking);
        // The car is not chosen by anyone: the day is split between the cars again with this game in it.
        crewCapacity.assignCars(request.date());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Booking> search(String venueSlug, LocalDate from, LocalDate to, BookingStatus status) {
        return bookingRepository.findAll(BookingSpecifications.matching(venueSlug, from, to, status),
                Sort.by("playDate", "startTime"));
    }

    @Transactional(readOnly = true)
    public Booking get(Long id) {
        return bookingRepository.findWithDetailsById(id)
                .orElseThrow(() -> new NotFoundException("Nincs ilyen foglalás: " + id));
    }

    @Transactional
    public Booking changeStatus(Long id, BookingStatus next) {
        Booking booking = get(id);
        if (!booking.getStatus().canChangeTo(next)) {
            throw new ConflictException("A foglalás nem állítható " + booking.getStatus() + " állapotból "
                    + next + " állapotba.");
        }
        booking.setStatus(next);
        booking.setUpdatedAt(Instant.now(clock));
        if (!BookingStatus.OCCUPYING.contains(next)) {
            // A rejected or cancelled game frees its car; the rest of the day may now pack better.
            booking.setCar(null);
            crewCapacity.assignCars(booking.getPlayDate());
        }
        return booking;
    }

    private Customer findOrCreateCustomer(CreateBookingRequest request, Instant now) {
        String email = request.email().trim().toLowerCase();
        Customer customer = customerRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            Customer created = new Customer();
            created.setEmail(email);
            created.setCreatedAt(now);
            return created;
        });
        // The latest contact details win, so the admin always sees the current phone number.
        customer.setName(request.name().trim());
        customer.setPhone(request.phone().trim());
        return customerRepository.save(customer);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
