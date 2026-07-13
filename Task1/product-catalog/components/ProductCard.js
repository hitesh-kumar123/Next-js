import Link from "next/link";

export default function ProductCard({ product }) {
    return (
        <div className="rounded-xl border bg-white shadow-md hover:shadow-xl transition duration-300 overflow-hidden">
            {product.image && (
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-56 w-full object-cover"
                />
            )}

            <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800">
                    {product.name}
                </h2>

                <p className="mt-2 text-lg font-semibold text-blue-600">
                    ₹{product.price.toLocaleString()}
                </p>

                <p className="mt-3 text-gray-600 line-clamp-3">
                    {product.description}
                </p>

                <Link
                    href={`/products/${product.id}`}
                    className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 transition"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}