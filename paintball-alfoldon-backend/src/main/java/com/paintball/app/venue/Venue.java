package com.paintball.app.venue;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A paintball field (pálya). The slug matches the route on the public site, e.g. {@code szeged-csarnok}. */
@Entity
@Table(name = "venue")
@Getter
@Setter
@NoArgsConstructor
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean indoor;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(name = "min_headcount", nullable = false)
    private int minHeadcount;

    @Column(name = "max_headcount", nullable = false)
    private int maxHeadcount;

    /** Inactive venues stay in the database for old bookings but cannot be booked. */
    @Column(nullable = false)
    private boolean active = true;
}
