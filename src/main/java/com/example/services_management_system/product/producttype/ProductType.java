package com.example.services_management_system.product.producttype;

import com.example.services_management_system.product.producttyperelation.ProductTypeRelation;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "product_types")
public class ProductType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    @NotBlank(message = "type of the product cannot be blank")
    @Size(max = 100, message = "type cannot be longer that 100 characters")
    private String type;

    @OneToMany(mappedBy = "productType", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<ProductTypeRelation> products = new HashSet<>();

    public ProductType(String type) {
        this.type = type;
    }

    public ProductType() {
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public Set<ProductTypeRelation> getProducts() {
        return products;
    }
}
