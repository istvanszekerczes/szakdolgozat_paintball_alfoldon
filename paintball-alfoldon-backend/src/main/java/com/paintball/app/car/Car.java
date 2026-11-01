package com.paintball.app.car;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A car that takes the equipment and the staff to a game. Deactivated instead of deleted. */
@Entity
@Table(name = "car")
@Getter
@Setter
@NoArgsConstructor
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Licence plate (rendszám), stored upper case, e.g. {@code ABC-123}. */
    @Column(nullable = false, unique = true)
    private String plate;

    /** Seats including the driver; at most this many employees can go with the car. */
    @Column(nullable = false)
    private int seats;

    @Column(nullable = false)
    private boolean active = true;
}
