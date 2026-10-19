package com.paintball.app.common;

/** The request is valid but clashes with the current state, e.g. the slot is already taken. */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
