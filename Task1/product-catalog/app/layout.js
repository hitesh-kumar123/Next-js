import "./globals.css";

export const metadata = {
    title: "Product Catalog",
    description: "Next.js Dynamic Routes Product Catalog",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="bg-gray-100 text-gray-900">
                {children}
            </body>
        </html>
    );
}