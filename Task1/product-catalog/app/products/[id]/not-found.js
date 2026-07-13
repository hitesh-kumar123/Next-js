import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
            <h1 className="mb-4 text-5xl font-bold text-red-600">
                Product Not Found
            </h1>

            <p className="mb-6 text-gray-600">
                Sorry, the product youre looking for doesnt exist.
            </p>

            <Link
                href="/products"
                className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
                Back to Products
            </Link>
        </main>
    );
}