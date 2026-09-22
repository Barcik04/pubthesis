package com.example.services_management_system.product.product.dto;

import com.example.services_management_system.product.product.Product;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductMapper {

    ProductResultDTO productToProductResultDTO(Product product);

    List<ProductResultDTO> productListToProductResponseDtoList(List<Product> products);
}
