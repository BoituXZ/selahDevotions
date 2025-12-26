import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { FeatureColor, FeatureLayout } from "../../types/features";

interface FeatureSectionProps {
    id: string;
    title: string;
    description: string;
    iconColor: FeatureColor;
    backgroundImage: string;
    layout: FeatureLayout;
}

export default function FeatureSection({
    id,
    title,
    description,
    backgroundImage,
    layout,
}: FeatureSectionProps) {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            ref={ref}
            id={id}
            aria-labelledby={`${id}-heading`}
            className="relative min-h-[80vh] md:min-h-screen flex items-center"
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backgroundImage})` }}
                aria-hidden="true"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-stone-900/85 via-stone-900/75 to-stone-800/85" />

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-16 w-full">
                <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${
                        layout === "content-right" ? "md:grid-flow-dense" : ""
                    }`}
                >
                    {/* Content Column */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            x: layout === "content-left" ? -50 : 50,
                        }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={
                            layout === "content-right" ? "md:col-start-2" : ""
                        }
                    >
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={isInView ? { scale: 1 } : {}}
                            transition={{
                                delay: 0.3,
                                type: "spring",
                                stiffness: 200,
                            }}
                            className=" w-20 h-20 rounded-full flex items-center justify-center mb-8 backdrop-blur-sm"
                        ></motion.div>

                        {/* Title */}
                        <h2
                            id={`${id}-heading`}
                            className="text-3xl md:text-4xl lg:text-5xl font-serif text-white mb-6"
                        >
                            {title}
                        </h2>

                        {/* Description */}
                        <p className="text-lg md:text-xl text-stone-200 leading-relaxed">
                            {description}
                        </p>
                    </motion.div>

                    {/* Visual Accent Column */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            x: layout === "content-left" ? 50 : -50,
                        }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{
                            duration: 0.8,
                            delay: 0.2,
                            ease: "easeOut",
                        }}
                        className={
                            layout === "content-right" ? "md:col-start-1" : ""
                        }
                    >
                        {/* Decorative Quote */}
                        <div className="hidden md:flex w-full h-64 md:h-96 items-center justify-center">
                            <div className="text-white/10 text-8xl lg:text-9xl font-serif">
                                "
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
