package com.example.services_management_system.product.product;

import com.example.services_management_system.product.product.dto.*;
import com.example.services_management_system.user.UserRepository;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/products")
@Validated
public class ProductController {
    private final ProductService productService;
    private final UserRepository userRepository;


    public ProductController(ProductService productService, UserRepository userRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PermitAll
    public Page<ProductResultCoordinatesDTO> getProductList(
            @ParameterObject @ModelAttribute ProductFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String city) {
        Pageable pageable = PageRequest.of(
                page,
                Math.min(size, 50)
        );

        return productService.getProductList(filter, pageable, city);
    }


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ProductResultDTO addProduct(
            @Valid @RequestPart("product") ProductCreateDTO createDto,
            @AuthenticationPrincipal Jwt jwt,
            @RequestPart(value = "image", required = false) MultipartFile image
            ) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();
        return productService.addProduct(createDto, image, userId);
    }


    @GetMapping("/my-products")
    @PreAuthorize("hasAuthority('USER')")
    public Page<ProductResultDTO> getAllProductsForUser(
            @ParameterObject @ModelAttribute ProductFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Pageable pageable = PageRequest.of(
                page,
                Math.min(size, 50)
        );

        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        return productService.getAllProductsForUser(pageable,filter, userId);
    }




    @PatchMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, value = "/{productId}")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ProductResultDTO updateProduct(
            @Valid @RequestPart("product") ProductUpdateDTO updateDto,
            @AuthenticationPrincipal Jwt jwt,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @PathVariable Long productId
    ) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        return productService.updateProduct(userId, image, productId, updateDto);
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public void deleteProduct(@AuthenticationPrincipal Jwt jwt, @PathVariable Long productId) {
        String username = jwt.getSubject();

        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getId();

        productService.deleteProduct(userId, productId);
    }



    @GetMapping("/{productId}")
    @PermitAll
    public ProductResultDtoWithMapLink findProductById(@PathVariable Long productId) {
        return productService.findProductById(productId);
    }
}
