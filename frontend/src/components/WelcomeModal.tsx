const COMMUNITY_LINK = "https://chat.whatsapp.com/Bm0oDO8Yoq2D3KvAGHbvtG";

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
            <div className="bg-amber-50/50 backdrop-blur w-full max-w-lg rounded-2xl shadow-2xl p-8 border border-amber-100">
                {/* Header */}
                <h2 className="text-2xl font-serif text-stone-800 mb-4">
                    You should probably read this...
                </h2>

                {/* Body - Personal note styling */}
                <div className="text-stone-700 leading-relaxed space-y-4 font-sans text-sm">
                    <p>
                        Hi, I'm Boitu. I made this so I can keep track of my
                        devotions... not at all because I'm a nerd with no
                        friends to send devotions to.{" "}
                        <em className="italic">*Awkward silence.*</em>
                    </p>

                    <p>
                        Anyways, if you do need a community, try this group:{" "}
                        <a
                            href={COMMUNITY_LINK}
                            className="text-stone-900 underline hover:text-stone-600 transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Join Here
                        </a>
                        .
                    </p>

                    <p>
                        But this is a passion project I created in a day. The AI
                        we use here is just for quick help. It has limited
                        responses, and when you hit that limit, maybe it's a
                        sign to read your Bible? I think so.
                    </p>

                    <p>All in all, have fun!</p>
                </div>

                {/* Action Button */}
                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-stone-900 text-white py-3 rounded-lg font-medium hover:bg-stone-800 transition shadow-lg hover:shadow-xl"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
