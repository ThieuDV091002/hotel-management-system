package com.example.HMS.exception;

public class DataIntegrityViolationException  extends RuntimeException {
    public DataIntegrityViolationException(String message) {
        super(message);
    }
}
