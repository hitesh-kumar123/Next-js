"use client";

import { useState } from "react";
import products from "@/data/products";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-6 text-center text-4xl font-bold text-gray-800">
          Product Catalog
        </h1>

        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {filteredProducts.length === 0 ? (
          <p className="text-center text-lg text-gray-600">
            No products found.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}