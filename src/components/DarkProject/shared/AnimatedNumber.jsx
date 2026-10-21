import { useEffect, useState } from "react";

const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));

export default function AnimatedNumber({ value, active, delay = 0, duration = 1450 }) {

    const [display, setDisplay] = useState(0);

    useEffect(() => {

        if (!active) return;

        let frame;

        let startTime;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reducedMotion) return;

        function animate(time) {

            if (startTime === undefined) {

                startTime = time;

            }

            const progress = clamp((time - startTime - delay) / duration);

            const eased = 1 - Math.pow(1 - progress, 3);

            setDisplay(Math.round(value * eased));

            if (progress < 1) {

                frame = requestAnimationFrame(animate);

            }

        }

        frame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frame);

    }, [value, active, delay, duration]);

    const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const number = active ? (reducedMotion ? value : display) : 0;

    return number.toLocaleString("nl-BE");

}
