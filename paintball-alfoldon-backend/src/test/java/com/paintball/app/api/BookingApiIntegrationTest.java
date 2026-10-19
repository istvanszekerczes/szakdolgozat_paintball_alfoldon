package com.paintball.app.api;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
    void invalidBookingReturnsFieldErrors() throws Exception {
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content("{\"venueSlug\":\"szeged\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());
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
