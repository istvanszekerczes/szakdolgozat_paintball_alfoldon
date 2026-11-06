package com.paintball.app.car;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface CarRepository extends JpaRepository<Car, Long> {

    List<Car> findAllByOrderByActiveDescPlateAsc();

    Optional<Car> findByPlateIgnoreCase(String plate);

    List<Car> findByActiveTrueOrderByPlateAsc();

    /**
     * The active cars with a row lock. Every new booking takes this lock first, so two customers
     * booking the last free crew of a day at different venues cannot both get it.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Car c where c.active = true order by c.plate")
    List<Car> findActiveForUpdate();
}
