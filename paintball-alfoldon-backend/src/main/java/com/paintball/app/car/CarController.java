package com.paintball.app.car;

import java.util.List;
import java.util.Locale;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.paintball.app.common.ConflictException;
import com.paintball.app.common.NotFoundException;

/** Cars (Erőforrások → Autók). Simple enough that the controller talks to the repository directly. */
@RestController
@RequestMapping("/api/admin/cars")
public class CarController {

    private final CarRepository carRepository;

    public CarController(CarRepository carRepository) {
        this.carRepository = carRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<CarResponse> list() {
        return carRepository.findAllByOrderByActiveDescPlateAsc().stream().map(CarResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public CarResponse create(@Valid @RequestBody CarRequest request) {
        Car car = new Car();
        apply(car, request);
        return CarResponse.from(carRepository.save(car));
    }

    @PutMapping("/{id}")
    @Transactional
    public CarResponse update(@PathVariable Long id, @Valid @RequestBody CarRequest request) {
        Car car = carRepository.findById(id).orElseThrow(() -> new NotFoundException("Nincs ilyen autó: " + id));
        apply(car, request);
        return CarResponse.from(car);
    }

    private void apply(Car car, CarRequest request) {
        String plate = request.plate().trim().toUpperCase(Locale.ROOT);
        carRepository.findByPlateIgnoreCase(plate)
                .filter(other -> !other.getId().equals(car.getId()))
                .ifPresent(other -> {
                    throw new ConflictException("Már van autó ezzel a rendszámmal: " + plate);
                });
        car.setPlate(plate);
        car.setSeats(request.seats());
        car.setActive(request.active() == null || request.active());
    }

    public record CarRequest(
            @NotBlank(message = "Add meg a rendszámot.") @Size(max = 20) String plate,
            @NotNull(message = "Add meg a férőhelyek számát.") @Positive(message = "Legalább 1 férőhely kell.") @Max(value = 60, message = "Legfeljebb 60 férőhely.") Integer seats,
            Boolean active) {
    }

    public record CarResponse(Long id, String plate, int seats, boolean active) {

        static CarResponse from(Car car) {
            return new CarResponse(car.getId(), car.getPlate(), car.getSeats(), car.isActive());
        }
    }
}
