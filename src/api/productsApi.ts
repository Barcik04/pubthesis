type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
};

type ProductsPage = {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

const API_URL = "http://localhost:8080/products";

export async function getProducts(page = 0, size = 20): Promise<ProductsPage> {
  const response = await fetch(`${API_URL}?page=${page}&size=${size}`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}


export async function getMyProducts(page = 0, size = 20): Promise<ProductsPage> {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(`${API_URL}/my-products?page=${page}&size=${size}`, {
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










type ProductCreateData = {
  name: string;
  description: string;
  price: number;
  types: string[];
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