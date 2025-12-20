interface UserAvatarProps {
    email: string;
    name?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export default function UserAvatar({
    email,
    name,
    size = "md",
}: UserAvatarProps) {
    // Extract initials from name or email
    const getInitials = () => {
        if (name) {
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        // If no name, use first 2 letters of email
        return email.slice(0, 2).toUpperCase();
    };

    const sizeClasses = {
        sm: "w-10 h-10 text-sm",
        md: "w-16 h-16 text-lg",
        lg: "w-24 h-24 text-2xl",
        xl: "w-32 h-32 text-4xl",
    };

    return (
        <div
            className={`
        ${sizeClasses[size]}
        rounded-full
        bg-gradient-to-br from-stone-800 to-stone-600
        flex items-center justify-center
        text-white font-serif font-bold
        shadow-lg border-4 border-white
        animate-[scaleIn_0.5s_ease-out]
      `}
        >
            {getInitials()}
        </div>
    );
}
