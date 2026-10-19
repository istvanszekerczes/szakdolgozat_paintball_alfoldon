package com.paintball.app.common;

/** A booking request breaks a business rule (too early, wrong slot, headcount out of range...). */
public class BookingRuleException extends RuntimeException {

    public BookingRuleException(String message) {
        super(message);
    }
}
