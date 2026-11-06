package com.paintball.app.schedule;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Gives the coming games their cars when the app starts, so bookings made before cars were assigned
 * automatically (or while the app ran with other rules) are brought up to date.
 */
@Component
public class CarAssignmentOnStartup implements ApplicationRunner {

    private final CrewCapacity crewCapacity;

    public CarAssignmentOnStartup(CrewCapacity crewCapacity) {
        this.crewCapacity = crewCapacity;
    }

    @Override
    public void run(ApplicationArguments args) {
        crewCapacity.assignCarsFromToday();
    }
}
