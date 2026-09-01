export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  types: string[];

  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;

  imageUrl?: string | null;
  offers: ProductOffer[];
  latitude?: number | null;
  longitude?: number | null;
};

type ProductsPage = {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

const API_URL = "http://localhost:8080/products";

export async function getProducts(
  page = 0,
  size = 20,
  name = "",
  types: string[] = [],
  minPrice?: number,
  maxPrice?: number,
  city?: string
): Promise<ProductsPage> {
  const params = new URLSearchParams();

  params.append("page", String(page));
  params.append("size", String(size));

  if (name.trim() !== "") {
    params.append("name", name.trim());
  }

  types.forEach((type) => {
    params.append("types", type);
  });

  if (minPrice !== undefined && minPrice !== null) {
    params.append("minPrice", String(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== null) {
    params.append("maxPrice", String(maxPrice));
  }

  if (city?.trim()) {
    params.append("city", city.trim());
  }

  const response = await fetch(`${API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}





export async function getMyProducts(
  page = 0,
  size = 20,
  name = "",
  types: string[] = [],
  minPrice?: number,
  maxPrice?: number
): Promise<ProductsPage> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const params = new URLSearchParams();

  params.append("page", String(page));
  params.append("size", String(size));

  if (name.trim() !== "") {
    params.append("name", name.trim());
  }

  types.forEach((type) => {
    params.append("types", type);
  });

    if (minPrice !== undefined && minPrice !== null) {
    params.append("minPrice", String(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== null) {
    params.append("maxPrice", String(maxPrice));
  }

  const response = await fetch(`${API_URL}/my-products?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch my products");
  }

  return response.json();
}



export type ProductType = {
  id: number;
  type: string;
};

export async function getProductTypes(): Promise<ProductType[]> {
  const response = await fetch("http://localhost:8080/types");

  if (!response.ok) {
    throw new Error("Failed to fetch product types");
  }

  return response.json();
}









export type ProductCreateData = {
  name: string;
  description: string;
  price: number;
  types: string[];

  street: string;
  houseNumber: string;
  city: string;
  country: string;
  postalCode: string;

  offers: ProductOfferCreateData[];
};

export async function createProduct(
  data: ProductCreateData,
  image: File | null
): Promise<Product> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const formData = new FormData();

  formData.append(
    "product",
    new Blob([JSON.stringify(data)], {
      type: "application/json",
    })
  );

  if (image) {
    formData.append("image", image);
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create product");
  }

  return response.json();
}








type ProductUpdateData = {
  name: string;
  description: string;
  price: number;
  types: string[];
  street: string;
  houseNumber: string;
  city: string;
  country: string;
  postalCode: string;
};

export async function updateProduct(
  productId: number,
  product: ProductUpdateData,
  image?: File | null
) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const formData = new FormData();

  formData.append(
    "product",
    new Blob([JSON.stringify(product)], {
      type: "application/json",
    })
  );

  if (image) {
    formData.append("image", image);
  }

  const response = await fetch(`${API_URL}/${productId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update product");
  }

  return response.json();
}











export async function deleteProduct(productId: number): Promise<void> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(`${API_URL}/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete product");
  }
}






export type ProductOffer = {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt?: string;
  duration?: number;

  availabilities: ProductOfferAvailability[];
};

export type ProductDetails = {
  id: number;
  name: string;
  description: string;
  types: string[];
  price: number;
  creationDate: string;
  isActive: boolean;
  imageUrl: string | null;
  offers: ProductOffer[];

  country: string | null;
  city: string | null;
  street: string | null;
  postalCode: string | null;
  houseNumber: string | null;
  googleMapsLink: string | null;
};

export async function getProductById(productId: number): Promise<ProductDetails> {
  const response = await fetch(`${API_URL}/${productId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product details");
  }

  return response.json();
}





export type ProductOfferCreateData = {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  cashPaymentAvailability: boolean;
};

export async function createProductOffer(
  productId: number,
  data: ProductOfferCreateData
): Promise<ProductOffer> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(
    `http://localhost:8080/offers/${productId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create product offer");
  }

  return response.json();
}

























export type ProductOfferAvailabilityCreateData = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  offerId: number;
};

export type ProductOfferAvailability = {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

export async function createProductOfferAvailability(
  data: ProductOfferAvailabilityCreateData
): Promise<ProductOfferAvailability> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch("http://localhost:8080/availability", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create product offer availability");
  }

  return response.json();
}







const RESERVATIONS_API_URL = "http://localhost:8080/reservations";

export type ReservationDate = {
  startTime: string;
  endTime: string;
};

export async function getReservationsByOfferId(
  offerId: number
): Promise<ReservationDate[]> {
  const response = await fetch(`${RESERVATIONS_API_URL}/${offerId}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reservations");
  }

  return response.json();
}








const OFFERS_API_URL = "http://localhost:8080/offers";

export type ProductOfferAvailabilityGet = {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

export type ProductOfferDetails = {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  availabilities: ProductOfferAvailabilityGet[];
  cashPaymentAvailability: boolean;
};

export async function getOfferById(
  offerId: number
): Promise<ProductOfferDetails> {
  const response = await fetch(`${OFFERS_API_URL}/${offerId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch offer");
  }

  return response.json();
}









export type ProductOfferAvailabilityUpdateData = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  offerId: number;
};

export type ProductOfferUpdateData = {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  cashPaymentAvailability: boolean;
  availabilities: ProductOfferAvailabilityUpdateData[];
};

export type ProductOfferUpdateResult = {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  cashPaymentAvailability: boolean;
  availabilities: ProductOfferAvailability[];
};

export async function updateProductOffer(
  offerId: number,
  data: ProductOfferUpdateData
): Promise<ProductOfferUpdateResult> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(
    `${OFFERS_API_URL}/${offerId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update product offer");
  }

  return response.json();
}








export async function deleteProductOffer(offerId: number): Promise<void> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(`${OFFERS_API_URL}/${offerId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete product offer");
  }
}








export type ReservationStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "CANCELLED";

export type MyReservation = {
  id: number;
  createdAt: string;
  status: ReservationStatus;
  paymentMethod: PaymentMethod;
  startTime: string;
  endTime: string;
  productId: number;
};

export async function getMyReservations(): Promise<MyReservation[]> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(
    `${RESERVATIONS_API_URL}/my-reservations`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user reservations");
  }

  return response.json();
}







export async function cancelReservation(
  reservationId: number
): Promise<void> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(
    `${RESERVATIONS_API_URL}/cancel/${reservationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to cancel reservation");
  }
}







export type PaymentMethod = "CASH" | "CARD";

export type ReservationWithOffer = {
  id: number;
  createdAt: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED";
  paymentMethod: PaymentMethod;
  startTime: string;
  endTime: string;
  username: string;
  productName: string;
  durationMinutes: number;
  offerDescription: string;
  offerName: string;
  offerPrice: number;
  firstName: string;
  lastName: string;
};

export type ReservationFilters = {
  username: string;
  offerName: string;
  firstName: string;
  lastName: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export async function getReservationsByProductId(
  productId: number,
  page: number = 0,
  size: number = 20,
  filters: ReservationFilters = {
    username: "",
    offerName: "",
    firstName: "",
    lastName: "",
  }
): Promise<PageResponse<ReservationWithOffer>> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filters.username.trim()) {
    params.append("username", filters.username.trim());
  }

  if (filters.offerName.trim()) {
    params.append("offerName", filters.offerName.trim());
  }

  if (filters.firstName.trim()) {
    params.append("firstName", filters.firstName.trim());
  }

  if (filters.lastName.trim()) {
    params.append("lastName", filters.lastName.trim());
  }

  const response = await fetch(
    `${RESERVATIONS_API_URL}/by-product/${productId}?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch product reservations");
  }

  return response.json();
}







export async function revokeReservation(
  reservationId: number
): Promise<void> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(
    `${RESERVATIONS_API_URL}/revoke/${reservationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to revoke reservation");
  }
}

















export type ReservationGuestCreateData = {
  productOfferId: number;
  startTime: string;
  guestFirstName: string;
  guestLastName: string;
  email: string;
  paymentMethod: PaymentMethod;
};

export type ReservationResultGuest = {
  id: number;
  createdAt: string;
  startTime: string;
  endTime: string;
  productId: number;
  guestPaymentToken: string;
};

export type InvoiceRequestCreateData = {
  buyerName: string;
  buyerNip: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
};

export async function createGuestReservation(
  data: ReservationGuestCreateData,
  invoice?: InvoiceRequestCreateData
): Promise<ReservationResultGuest> {
  const response = await fetch(`${RESERVATIONS_API_URL}/guest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reservationGuestCreateDto: data,
      invoiceRequestCreateDto: invoice ?? null,
    }),
  });

  if (!response.ok) {
    const error = new Error(
      "Failed to create guest reservation"
    ) as Error & {
      status?: number;
    };

    error.status = response.status;
    throw error;
  }

  return response.json();
}







export type ReservationCreateData = {
  productOfferId: number;
  startTime: string;
  paymentMethod: PaymentMethod;
};

export type ReservationResult = {
  id: number;
  createdAt: string;
  startTime: string;
  endTime: string;
  productId: number;
  status: ReservationStatus;
  paymentMethod: PaymentMethod;
  cashPaymentAvailability: boolean;
};

export async function createReservation(
  data: ReservationCreateData,
  invoice?: InvoiceRequestCreateData
): Promise<ReservationResult> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(RESERVATIONS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reservationCreateDto: data,
      invoiceRequestCreateDto: invoice ?? null,
    }),
  });

  if (!response.ok) {
    const error = new Error(
      "Failed to create reservation"
    ) as Error & {
      status?: number;
    };

    error.status = response.status;
    throw error;
  }

  return response.json();
}







export type InvoiceFilter = {
  email?: string;
  issued?: boolean;
};

export type InvoiceResult = {
  id: number;
  buyerName: string;
  buyerNip: string | null;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
  status: string;
  requestedAt: string;
  issuedAt: string | null;
};

export async function getInvoices(
  filter: InvoiceFilter = {},
  page = 0,
  size = 20
): Promise<PageResponse<InvoiceResult>> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filter.email?.trim()) {
    params.set("email", filter.email.trim());
  }

  if (filter.issued !== undefined) {
    params.set("issued", filter.issued.toString());
  }

  const response = await fetch(
    `http://localhost:8080/invoice?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = new Error("Failed to load invoices") as Error & {
      status?: number;
    };

    error.status = response.status;
    throw error;
  }

  return response.json();
}










export async function markInvoiceAsIssued(
  invoiceId: number
): Promise<InvoiceResult> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(
    `http://localhost:8080/invoice/${invoiceId}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = new Error("Failed to mark invoice as issued") as Error & {
      status?: number;
    };

    error.status = response.status;
    throw error;
  }

  return response.json();
}











export type PaymentIntentResult = {
  paymentIntentId: string;
  clientSecret: string;
};

export async function createPaymentIntent(
  reservationId: number
): Promise<PaymentIntentResult> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(
    "http://localhost:8080/payments/payment-intent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reservationId,
      }),
    }
  );

  if (!response.ok) {
    const error = new Error(
      "Failed to create payment intent"
    ) as Error & {
      status?: number;
    };

    error.status = response.status;
    throw error;
  }

  return response.json();
}







export async function createGuestPaymentIntent(
  reservationId: number,
  guestPaymentToken: string
): Promise<PaymentIntentResult> {
  const response = await fetch(
    "http://localhost:8080/payments/guest/payment-intent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        reservationId,
        guestPaymentToken,
      }),
    }
  );

  if (!response.ok) {
    const error = new Error(
      "Failed to create guest payment intent"
    ) as Error & {
      status?: number;
    };

    error.status = response.status;
    throw error;
  }

  return response.json();
}








export type CitySearchResult = {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
};

export async function searchCities(
  name: string
): Promise<CitySearchResult[]> {
  const response = await fetch(
    `http://localhost:8080/locations/cities?name=${encodeURIComponent(
      name.trim()
    )}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = new Error(
      "Failed to search cities"
    ) as Error & {
      status?: number;
    };

    error.status = response.status;
    throw error;
  }

  return response.json();
}