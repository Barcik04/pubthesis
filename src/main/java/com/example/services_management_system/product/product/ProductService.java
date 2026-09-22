package com.example.services_management_system.product.product;


import com.example.services_management_system.product.product.dto.*;
import com.example.services_management_system.product.productoffers.dto.ProductOfferResultDto;
import com.example.services_management_system.product.productoffers.mapper.ProductOfferMapper;
import com.example.services_management_system.product.producttype.ProductType;
import com.example.services_management_system.product.producttype.ProductTypeRepository;
import com.example.services_management_system.product.producttyperelation.ProductTypeRelation;
import com.example.services_management_system.product.producttyperelation.ProductTypeRelationRepository;
import com.example.services_management_system.user.User;
import com.example.services_management_system.user.UserRepository;
import com.example.services_management_system.utils.exception.OwnershipViolationException;
import com.example.services_management_system.utils.filtering.product.ProductSpecification;
import com.example.services_management_system.utils.nominatim.NominatimService;
import com.example.services_management_system.utils.nominatim.dto.GeocodeResultDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductTypeRepository productTypeRepository;
    private final ProductTypeRelationRepository productTypeRelationRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;
    private final ProductOfferMapper productOfferMapper;
    private final NominatimService nominatimService;

    public ProductService(ProductRepository productRepository, ProductTypeRepository productTypeRepository, ProductTypeRelationRepository productTypeRelationRepository, UserRepository userRepository, ProductMapper productMapper, ProductOfferMapper productOfferMapper, NominatimService nominatimService) {
        this.productRepository = productRepository;
        this.productTypeRepository = productTypeRepository;
        this.productTypeRelationRepository = productTypeRelationRepository;
        this.userRepository = userRepository;
        this.productMapper = productMapper;
        this.productOfferMapper = productOfferMapper;
        this.nominatimService = nominatimService;
    }

    @Transactional(readOnly = true)
    public Page<ProductResultCoordinatesDTO> getProductList(ProductFilter filter, Pageable pageable, String city) {
        Specification<Product> spec = Specification.allOf(
                ProductSpecification.textSearch(filter),
                ProductSpecification.hasTypes(filter),
                ProductSpecification.priceBetween(filter),
                ProductSpecification.hasCity(city)
        );

        Page<Product> products = productRepository.findAll(spec, pageable);

        return products
                .map(product -> new ProductResultCoordinatesDTO(
                        product.getId(),
                        product.getName(),
                        product.getDescription(),
                        product.getProductTypes()
                                .stream()
                                .map(relation -> relation.getProductType().getType())
                                .collect(Collectors.toSet()),
                        product.getPrice(),
                        product.getCreatedAt(),
                        product.isActive(),
                        product.getImageUrl(),
                        productOfferMapper.productOffersToDto(product.getOffers()),
                        product.getCountry(),
                        product.getCity(),
                        product.getStreet(),
                        product.getPostalCode(),
                        product.getHouseNumber(),
                        product.getLatitude(),
                        product.getLongitude()
                ));
    }

    /**
     * Method for adding a product to users account with given types.
     *
     * @param createDto
     * @return
     */
    @Transactional
    public ProductResultDTO addProduct(ProductCreateDTO createDto, MultipartFile image, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        String imageUrl = null;

        if (image != null && !image.isEmpty()) {
            try {
                Path uploadPath = Path.of("/app/uploads/products")
                        .toAbsolutePath()
                        .normalize();

                Files.createDirectories(uploadPath);

                String originalFilename = image.getOriginalFilename();
                String fileName = UUID.randomUUID() + "_" + originalFilename;

                Path filePath = uploadPath.resolve(fileName);

                image.transferTo(filePath);

                imageUrl = "/uploads/products/" + fileName;

            } catch (IOException e) {
                throw new RuntimeException("Failed to save image", e);
            }
        }

        // firstly we need to trim types and find distinct
        List<String> requestedTypes = createDto.types().stream()
                .map(String::trim)
                .filter(type -> !type.isBlank())
                .distinct()
                .toList();

        List<ProductType> foundTypes = productTypeRepository.findAllByTypeIn(requestedTypes);


        // searching for only new types that are not in a db yet and then saving them all.
        Set<String> existingTypeNames = foundTypes.stream()
                .map(ProductType::getType)
                .collect(Collectors.toSet());

        List<ProductType> newTypes = requestedTypes.stream()
                .filter(type -> !existingTypeNames.contains(type))
                .map(ProductType::new)
                .toList();



        List<ProductType> savedNewTypes = productTypeRepository.saveAll(newTypes);

        Optional<GeocodeResultDTO> geocodeResult = nominatimService.geocodeAddress(
                createDto.country(),
                createDto.city(),
                createDto.street(),
                createDto.postalCode(),
                createDto.houseNumber()
        );

        Product product = productRepository.save(new Product(
                createDto.name(),
                createDto.description(),
                createDto.price(),
                user,
                imageUrl,
                createDto.country(),
                createDto.city(),
                createDto.street(),
                createDto.postalCode(),
                createDto.houseNumber(),
                geocodeResult.map(GeocodeResultDTO::latitude).orElse(null),
                geocodeResult.map(GeocodeResultDTO::longitude).orElse(null)
        ));

        // making a list of all types that were requested to be connected to this product to then save relations between them.
        List<ProductType> allTypes = new ArrayList<>();
        allTypes.addAll(foundTypes);
        allTypes.addAll(savedNewTypes);

        List<ProductTypeRelation> relations = allTypes.stream()
                .map(type -> new ProductTypeRelation(product, type))
                .toList();

        productTypeRelationRepository.saveAll(relations);

        // mapping ProductType objects to strings for cleaner DTO return.
        Set<String> resultTypes = allTypes.stream()
                .map(ProductType::getType)
                .collect(Collectors.toSet());

        Set<ProductOfferResultDto> offers = productOfferMapper.productOffersToDto(product.getOffers());



        return new ProductResultDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                resultTypes,
                product.getPrice(),
                product.getCreatedAt(),
                product.isActive(),
                product.getImageUrl(),
                offers,
                product.getCountry(),
                product.getCity(),
                product.getStreet(),
                product.getPostalCode(),
                product.getHouseNumber()
        );
    }






    @Transactional(readOnly = true)
    public Page<ProductResultDTO> getAllProductsForUser(Pageable pageable, ProductFilter filter, Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Specification<Product> userSpec = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("user").get("id"), userId);

        Specification<Product> spec = Specification.allOf(
                userSpec,
                ProductSpecification.textSearch(filter),
                ProductSpecification.hasTypes(filter),
                ProductSpecification.priceBetween(filter)
        );

        return productRepository.findAll(spec, pageable)
                .map(productMapper::productToProductResultDTO);
    }



    @Transactional
    public ProductResultDTO updateProduct(Long userId, MultipartFile image, Long productId, ProductUpdateDTO updateDTO) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("cannot find productId"));

        String imageUrl = null;

        if (image != null && !image.isEmpty()) {
            try {
                Path uploadPath = Path.of("/app/uploads/products")
                        .toAbsolutePath()
                        .normalize();

                Files.createDirectories(uploadPath);

                String originalFilename = image.getOriginalFilename();
                String fileName = UUID.randomUUID() + "_" + originalFilename;

                Path filePath = uploadPath.resolve(fileName);

                image.transferTo(filePath);

                imageUrl = "/uploads/products/" + fileName;

            } catch (IOException e) {
                throw new RuntimeException("Failed to save image", e);
            }
        }



        Set<String> types = product.getProductTypes().stream()
                .map(type -> type.getProductType().getType())
                .collect(Collectors.toSet());

        product.setName(updateDTO.name());
        product.setDescription(updateDTO.description());
        product.setPrice(updateDTO.price());
        product.setCountry(updateDTO.country());
        product.setCity(updateDTO.city());
        product.setStreet(updateDTO.street());
        product.setPostalCode(updateDTO.postalCode());
        product.setHouseNumber(updateDTO.houseNumber());
        for (String type : types) {
            if (types.contains(type)) {
                continue;
            }

            ProductType productType = new ProductType(type);
            productTypeRepository.save(productType);
            productTypeRelationRepository.save(new ProductTypeRelation(product, productType));
        }
        if (imageUrl != null) {
            product.setImageUrl(imageUrl);
        }

        Set<ProductOfferResultDto> offers = productOfferMapper.productOffersToDto(product.getOffers());

        return new ProductResultDTO(
                productId,
                updateDTO.name(),
                updateDTO.description(),
                types,
                updateDTO.price(),
                product.getCreatedAt(),
                product.isActive(),
                imageUrl,
                offers,
                product.getCountry(),
                product.getCity(),
                product.getStreet(),
                product.getPostalCode(),
                product.getHouseNumber()
        );
    }



    @Transactional
    public void deleteProduct(Long userId, Long productId) {
        Product product = productRepository.findByIdAndUserId(productId, userId)
                .orElseThrow(() -> new OwnershipViolationException("Product not found or does not belong to you"));

        productRepository.delete(product);
    }


    @Transactional(readOnly = true)
    public ProductResultDtoWithMapLink findProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("product with this id: " + productId + " not found"));

        Set<String> types = product.getProductTypes().stream()
                .map(type -> type.getProductType().getType())
                .collect(Collectors.toSet());

        Set<ProductOfferResultDto> offers = productOfferMapper.productOffersToDto(product.getOffers());

        String fullAddress = "%s %s, %s %s, %s".formatted(
                product.getStreet(),
                product.getHouseNumber(),
                product.getPostalCode(),
                product.getCity(),
                product.getCountry()
        );

        String googleMapsLink =
                "https://www.google.com/maps/search/?api=1&query="
                        + URLEncoder.encode(
                        fullAddress,
                        StandardCharsets.UTF_8
                );

        return new ProductResultDtoWithMapLink(
                productId,
                product.getName(),
                product.getDescription(),
                types,
                product.getPrice(),
                product.getCreatedAt(),
                product.isActive(),
                product.getImageUrl(),
                offers,
                product.getCountry(),
                product.getCity(),
                product.getStreet(),
                product.getPostalCode(),
                product.getHouseNumber(),
                googleMapsLink
        );
    }
}
