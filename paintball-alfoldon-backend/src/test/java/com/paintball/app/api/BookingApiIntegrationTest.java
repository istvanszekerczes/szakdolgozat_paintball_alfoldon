package com.paintball.app.api;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** End-to-end through HTTP, security and the (H2) database, with the real Flyway migrations. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class BookingApiIntegrationTest {

    private static final String SITE = "http://localhost:4200";
    private static final String DASHBOARD = "http://localhost:4300";

    @Autowired
    private MockMvc mvc;

    private final LocalDate playDate = LocalDate.now(ZoneId.of("Europe/Budapest")).plusDays(14);

    @Test
    void listsSeededVenuesWithCoordinates() throws Exception {
        mvc.perform(get("/api/venues"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(7)))
                .andExpect(jsonPath("$[?(@.slug == 'kecskemet')].latitude").value(46.887551));
    }

    @Test
    void bookingFlowFromCustomerToAdmin() throws Exception {
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(bookingJson("10:00")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.endTime").value("12:00:00"));

        // Same slot again is refused, and the availability view shows it as taken.
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(bookingJson("10:00")))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/venues/szeged/availability").param("date", playDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookable").value(true))
                .andExpect(jsonPath("$.slots[?(@.start == '10:00:00')].available").value(false))
                .andExpect(jsonPath("$.slots[?(@.start == '08:00:00')].available").value(true));

        String token = login();
        mvc.perform(get("/api/admin/bookings").param("venue", "szeged").param("status", "PENDING")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].customer.email").value("bela@example.com"));

        mvc.perform(patch("/api/admin/bookings/1/status").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"ACCEPTED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }

    @Test
    void staffCarsAssignmentAndSchedule() throws Exception {
        String token = login();
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(bookingJson("10:00")))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(bookingJson("12:00")))
                .andExpect(status().isCreated());
        for (int id = 1; id <= 2; id++) {
            mvc.perform(patch("/api/admin/bookings/" + id + "/status").header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"ACCEPTED\"}"))
                    .andExpect(status().isOk());
        }

        mvc.perform(post("/api/admin/cars").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"plate\":\"abc-123\",\"seats\":5}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.plate").value("ABC-123"));
        mvc.perform(post("/api/admin/employees").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Nagy Anna\",\"phone\":\"+36 30 111 2222\",\"employmentType\":\"FULL_TIME\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.active").value(true));

        // Same venue, back to back: the app put both games on the same car, one crew does both.
        for (int id = 1; id <= 2; id++) {
            mvc.perform(put("/api/admin/bookings/" + id + "/assignment").header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON).content("{\"employeeIds\":[1]}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.car.plate").value("AUTO-1"))
                    .andExpect(jsonPath("$.employees[0].name").value("Nagy Anna"));
        }

        mvc.perform(get("/api/admin/schedule").param("date", playDate.toString())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cars[1].segments[0].type").value("TRAVEL_OUT"))
                .andExpect(jsonPath("$.cars[1].segments[0].start").value("09:00:00"))
                .andExpect(jsonPath("$.staff[0].from").value("09:00:00"))
                .andExpect(jsonPath("$.staff[0].to").value("14:45:00"))
                .andExpect(jsonPath("$.unassigned", hasSize(0)));

        // Away on that day: the assignment is refused.
        mvc.perform(post("/api/admin/employees/1/exclusions").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"dateFrom\":\"%s\",\"dateTo\":\"%s\",\"reason\":\"szabadság\"}".formatted(playDate, playDate)))
                .andExpect(status().isCreated());
        mvc.perform(put("/api/admin/bookings/1/assignment").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"employeeIds\":[1]}"))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/admin/alerts").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.type == 'EMPLOYEE_AWAY')]", hasSize(2)));
    }

    @Test
    void venueBlockClosesSlotsAndPasswordCanBeChanged() throws Exception {
        String token = login();
        mvc.perform(post("/api/admin/venues/1/blocks").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"startsAt\":\"%sT09:00:00\",\"endsAt\":\"%sT13:00:00\",\"reason\":\"karbantartás\"}"
                        .formatted(playDate, playDate)))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/venues/szeged/availability").param("date", playDate.toString()))
                .andExpect(jsonPath("$.slots[?(@.start == '08:00:00')].available").value(false))
                .andExpect(jsonPath("$.slots[?(@.start == '14:00:00')].available").value(true));
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(bookingJson("10:00")))
                .andExpect(status().isConflict());

        mvc.perform(post("/api/admin/auth/password").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"wrong\",\"newPassword\":\"new-password-1\"}"))
                .andExpect(status().isUnprocessableContent());
        mvc.perform(post("/api/admin/auth/password").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"admin-password\",\"newPassword\":\"new-password-1\"}"))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/admin/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"admin\",\"password\":\"new-password-1\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void offersTheTimeThatPacksTheCrewsDayAndRefusesAThirdCar() throws Exception {
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(bookingJson("10:00")))
                .andExpect(status().isCreated());

        // The crew ends in Szeged at 12:00; packing up, 15 min driving and setting up: the hall from 13:30.
        mvc.perform(get("/api/venues/szeged-csarnok/availability").param("date", playDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slots[?(@.start == '13:30:00')].recommended").value(true))
                .andExpect(jsonPath("$.slots[?(@.start == '14:00:00')].recommended").value(true))
                .andExpect(jsonPath("$.slots[?(@.start == '08:00:00')].recommended").value(false))
                .andExpect(jsonPath("$.slots[?(@.start == '08:00:00')].available").value(true))
                .andExpect(jsonPath("$.slots[?(@.start == '14:00:00')].available").value(true));

        // Two cars: two more games at 10:00 elsewhere would need a third one.
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON)
                .content(bookingJson("10:00").replace("\"szeged\"", "\"szeged-csarnok\"")))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON)
                .content(bookingJson("10:00").replace("\"szeged\"", "\"szentes\"")))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/venues/szentes/availability").param("date", playDate.toString()))
                .andExpect(jsonPath("$.slots[?(@.start == '10:00:00')].available").value(false));

        String token = login();
        mvc.perform(get("/api/admin/schedule/proposal").param("date", playDate.toString())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fits").value(true))
                .andExpect(jsonPath("$.games", hasSize(2)))
                .andExpect(jsonPath("$.games[0].plate").value("AUTO-1"))
                .andExpect(jsonPath("$.games[1].plate").value("AUTO-2"));
    }

    @Test
    void invalidBookingReturnsFieldErrors() throws Exception {
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content("{\"venueSlug\":\"szeged\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    void aLaterBookingWithTheSameEmailKeepsEarlierNamesAndPhones() throws Exception {
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(bookingJson("10:00")))
                .andExpect(status().isCreated());
        String later = bookingJson("12:00").replace("Kiss Béla", "Nagy Éva").replace("+36 30 123 4567", "+36 20 999 8888");
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(later))
                .andExpect(status().isCreated());

        mvc.perform(get("/api/admin/bookings").header("Authorization", "Bearer " + login()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.startTime == '10:00:00')].customer.name").value("Kiss Béla"))
                .andExpect(jsonPath("$[?(@.startTime == '10:00:00')].customer.phone").value("+36 30 123 4567"))
                .andExpect(jsonPath("$[?(@.startTime == '12:00:00')].customer.name").value("Nagy Éva"))
                .andExpect(jsonPath("$[?(@.startTime == '12:00:00')].customer.phone").value("+36 20 999 8888"));
    }

    @Test
    void phoneWithoutDigitsIsRefused() throws Exception {
        String json = bookingJson("10:00").replaceAll("\"phone\"\\s*:\\s*\"[^\"]*\"", "\"phone\":\"((((((()))\"");
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.phone").exists());
    }

    @Test
    void fractionalHeadcountIsRefusedInsteadOfRounded() throws Exception {
        String json = bookingJson("10:00").replaceAll("\"headcount\"\\s*:\\s*\\d+", "\"headcount\":24.5");
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Hibás adatok."));
    }

    @Test
    void malformedJsonGetsTheUsualErrorFormat() throws Exception {
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content("{nem json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Hibás adatok."));
    }

    @Test
    void bookingInsideOneWeekIsRefused() throws Exception {
        String json = bookingJson("10:00").replace(playDate.toString(), playDate.minusDays(10).toString());
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void adminEndpointsNeedToken() throws Exception {
        mvc.perform(get("/api/admin/bookings")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/admin/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"admin\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void corsSeparatesSiteAndDashboard() throws Exception {
        mvc.perform(options("/api/admin/bookings").header("Origin", DASHBOARD)
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", DASHBOARD));
        mvc.perform(options("/api/admin/bookings").header("Origin", SITE)
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
        mvc.perform(options("/api/bookings").header("Origin", SITE)
                .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk());
        mvc.perform(options("/api/bookings").header("Origin", DASHBOARD)
                .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    private String login() throws Exception {
        String body = mvc.perform(post("/api/admin/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"admin\",\"password\":\"admin-password\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        Matcher matcher = Pattern.compile("\"token\":\"([^\"]+)\"").matcher(body);
        matcher.find();
        return matcher.group(1);
    }

    private String bookingJson(String start) {
        return """
                {"venueSlug":"szeged","date":"%s","startTime":"%s","headcount":20,
                 "name":"Kiss Béla","email":"bela@example.com","phone":"+36 30 123 4567"}
                """.formatted(playDate, start);
    }
}
