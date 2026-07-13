import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import products from "@/data/products";

export async function generateStaticParams() {
    return products.map((product) => ({
        id: product.id,
    }));
}

export async function generateMetadata({ params }) {
    const { id } = await params;

    const product = products.find((p) => p.id === id);

    if (!product) {
        return {
            title: "Product Not Found",
        };
    }

    return {
        title: product.name,
        description: product.description,
    };
}

export default async function ProductDetails({ params }) {
    const { id } = await params;

    const product = products.find((p) => p.id === id);

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-100 py-10">
            <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
                {product.image && (
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={800}
                        height={500}
                        className="mb-6 h-96 w-full rounded-lg object-cover"
                    />
                )}

                <h1 className="mb-4 text-4xl font-bold">{product.name}</h1>

                <p className="mb-4 text-2xl font-semibold text-blue-600">
                    ₹{product.price.toLocaleString()}
                </p>

                <p className="mb-8 text-lg text-gray-700">
                    {product.description}
                </p>

                <Link
                    href="/products"
                    className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                >
                    ← Back to Products
                </Link>
            </div>
        </main>
    );
}