package com.paintball.app.car;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CarRepository extends JpaRepository<Car, Long> {

    List<Car> findAllByOrderByActiveDescPlateAsc();

    Optional<Car> findByPlateIgnoreCase(String plate);
}
