import SelahLogo from "./SelahLogo";

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export default function Loading({
    message,
    fullScreen = true,
}: LoadingProps) {
    const containerClass = fullScreen
        ? "fixed inset-0 flex flex-col items-center justify-center bg-stone-50"
        : "flex flex-col items-center justify-center py-12";

    return (
        <div className={containerClass}>
            <SelahLogo size="lg" animated />
            {message && (
                <p className="mt-4 text-stone-500 text-sm font-sans">
                    {message}
                </p>
            )}
        </div>
    );
}
