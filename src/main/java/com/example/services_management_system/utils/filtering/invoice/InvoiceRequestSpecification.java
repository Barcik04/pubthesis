package com.example.services_management_system.utils.filtering.invoice;

import com.example.services_management_system.payment.invoice.InvoiceRequest;
import com.example.services_management_system.payment.invoice.dto.InvoiceFilter;
import org.springframework.data.jpa.domain.Specification;

public class InvoiceRequestSpecification {
    public static Specification<InvoiceRequest> textSearch(InvoiceFilter filter) {
        return (root, query, criteriaBuilder) -> {
            var predicate = criteriaBuilder.conjunction();

            if (filter != null && filter.getEmail() != null && !filter.getEmail().isBlank()) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("email")),
                                "%" + filter.getEmail().toLowerCase() + "%"
                        )
                );
            }

            return predicate;
        };
    }


    public static Specification<InvoiceRequest> issued(InvoiceFilter filter) {
        return (root, query, criteriaBuilder) -> {
            if (filter == null || filter.getIssued() == null) {
                return criteriaBuilder.conjunction();
            }

            if (filter.getIssued()) {
                return criteriaBuilder.isNotNull(root.get("issuedAt"));
            }

            return criteriaBuilder.isNull(root.get("issuedAt"));
        };
    }
}
