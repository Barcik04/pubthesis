package com.example.services_management_system.product.producttyperelation;

import com.example.services_management_system.product.product.Product;
import com.example.services_management_system.product.producttype.ProductType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Entity
@Table(name = "product_type_relation")
public class ProductTypeRelation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", foreignKey = @ForeignKey(name = "product_type_relation_product_id_fk"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_type_id", foreignKey = @ForeignKey(name = "product_type_relation_product_type_id_fk"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ProductType productType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;


    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public ProductTypeRelation(Product product, ProductType productType) {
        this.product = product;
        this.productType = productType;
    }

    public ProductTypeRelation() {
    }

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public ProductType getProductType() {
        return productType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
