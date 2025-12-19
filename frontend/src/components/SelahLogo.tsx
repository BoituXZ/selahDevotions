interface SelahLogoProps {
    size?: "sm" | "md" | "lg";
    animated?: boolean;
}

export default function SelahLogo({
    size = "md",
    animated = true,
}: SelahLogoProps) {
    const sizeClasses = {
        sm: "text-2xl",
        md: "text-4xl",
        lg: "text-6xl",
    };

    return (
        <div className="flex items-center justify-center">
            <h1
                className={`
          ${sizeClasses[size]}
          font-serif
          text-stone-800
          tracking-tight
          ${animated ? "animate-pulse" : ""}
        `}
            >
                Selah.
            </h1>
        </div>
    );
}
