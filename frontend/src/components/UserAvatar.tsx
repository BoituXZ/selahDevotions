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
        sm: "w-10 h-10 text-xs",
        md: "w-16 h-16 text-lg",
        lg: "w-24 h-24 text-2xl",
        xl: "w-32 h-32 text-4xl",
    };

    return (
        <div
            className={`
        ${sizeClasses[size]}
        rounded-full
        bg-[#A3B18A]
        flex items-center justify-center
        text-white font-serif font-bold
        shadow-sm border border-[#94A07C]
        animate-[scaleIn_0.5s_ease-out]
      `}
        >
            {getInitials()}
        </div>
    );
}
