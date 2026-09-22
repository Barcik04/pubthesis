package com.example.services_management_system.utils.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.ZonedDateTime;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpectedException(
            Exception e,
            HttpServletRequest request) {


        ApiError apiError = new ApiError(
                e.getClass().getName(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ZonedDateTime.now(),
                request.getRequestURI(),
                null
        );

        log.error("Unexpected server error on {} {} {} {}", request.getMethod(), request.getRequestURI(), e.getMessage(), apiError.status());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiError);
    }


    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiError> handleNoSuchElementException(
            NoSuchElementException e,
            HttpServletRequest request
    ) {

        ApiError apiError = new ApiError(
                e.getMessage(),
                HttpStatus.NOT_FOUND.value(),
                ZonedDateTime.now(),
                request.getRequestURI(),
                null
        );

        log.warn("Element not found on {} {} {} {}", request.getMethod(), request.getRequestURI(), e.getMessage(), apiError.status());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiError);

    }


    @ExceptionHandler(OwnershipViolationException.class)
    public ResponseEntity<ApiError> handleOwnershipViolationException(
            OwnershipViolationException e,
            HttpServletRequest request
    ) {

        ApiError apiError = new ApiError(
                e.getMessage(),
                HttpStatus.CONFLICT.value(),
                ZonedDateTime.now(),
                request.getRequestURI(),
                null
        );

        log.warn("Ownership violation on {} {} {} {}", request.getMethod(), request.getRequestURI(), e.getMessage(), apiError.status());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(apiError);
    }



    @ExceptionHandler(DatesOverlappingException.class)
    public ResponseEntity<ApiError> handleDatesOverlappingException(
            DatesOverlappingException e,
            HttpServletRequest request
    ) {

        ApiError apiError = new ApiError(
                e.getMessage(),
                HttpStatus.CONFLICT.value(),
                ZonedDateTime.now(),
                request.getRequestURI(),
                null
        );

        log.warn("Dates overlapping exception {} {} {} {}", request.getMethod(), request.getRequestURI(), e.getMessage(), apiError.status());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(apiError);
    }



    @ExceptionHandler(DateInThePastException.class)
    public ResponseEntity<ApiError> handleDateInThePastException(
            DateInThePastException e,
            HttpServletRequest request
    ) {

        ApiError apiError = new ApiError(
                e.getMessage(),
                HttpStatus.FORBIDDEN.value(),
                ZonedDateTime.now(),
                request.getRequestURI(),
                null
        );

        log.warn("Create date is in the past but has to be in the future {} {} {} {}", request.getMethod(), request.getRequestURI(), e.getMessage(), apiError.status());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(apiError);
    }

    @ExceptionHandler(InvoiceUnavailableException.class)
    public ResponseEntity<ApiError> handleDateInThePastException(
            InvoiceUnavailableException e,
            HttpServletRequest request
    ) {

        ApiError apiError = new ApiError(
                e.getMessage(),
                HttpStatus.FORBIDDEN.value(),
                ZonedDateTime.now(),
                request.getRequestURI(),
                null
        );

        log.warn("Invoice is not available {} {} {} {}", request.getMethod(), request.getRequestURI(), e.getMessage(), apiError.status());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(apiError);
    }
}