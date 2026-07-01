package com.studyace.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        StringBuilder messageBuilder = new StringBuilder();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            String field = error.getField();
            String message = error.getDefaultMessage();
            errors.put(field, message);
            if (messageBuilder.length() == 0) {
                messageBuilder.append(field).append(": ").append(message);
            }
        }
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(Map.of("message", messageBuilder.toString(), "errors", errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleFallback(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Unexpected server error"));
    }
}
