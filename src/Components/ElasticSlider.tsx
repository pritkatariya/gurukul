import { useEffect, useRef, useState, type ReactNode } from "react";
import {
    animate,
    motion,
    useMotionValue,
    useMotionValueEvent,
    useTransform,
} from "motion/react";

const MAX_OVERFLOW = 50;

interface ElasticSliderProps {
    defaultValue?: number;
    startingValue?: number;
    maxValue?: number;
    className?: string;
    isStepped?: boolean;
    stepSize?: number;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    onChange?: (value: number) => void;
}

export default function ElasticSlider({
    defaultValue = 50,
    startingValue = 0,
    maxValue = 100,
    className = "",
    isStepped = false,
    stepSize = 1,
    leftIcon = <>-</>,
    rightIcon = <>+</>,
    onChange,
}: ElasticSliderProps) {
    return (
        <div className={`relative flex w-48 flex-col items-center justify-center gap-4 ${className}`}>
            <Slider
                defaultValue={defaultValue}
                startingValue={startingValue}
                maxValue={maxValue}
                isStepped={isStepped}
                stepSize={stepSize}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
                onChange={onChange}
            />
        </div>
    );
}

interface SliderProps {
    defaultValue: number;
    startingValue: number;
    maxValue: number;
    isStepped: boolean;
    stepSize: number;
    leftIcon: ReactNode;
    rightIcon: ReactNode;
    onChange?: (value: number) => void;
}

function Slider({
    defaultValue,
    startingValue,
    maxValue,
    isStepped,
    stepSize,
    leftIcon,
    rightIcon,
    onChange,
}: SliderProps) {
    const [value, setValue] = useState<number>(defaultValue);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [region, setRegion] = useState<"left" | "middle" | "right">("middle");
    const clientX = useMotionValue(0);
    const overflow = useMotionValue(0);
    const scale = useMotionValue(1);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    useMotionValueEvent(clientX, "change", (latest: number) => {
        if (!sliderRef.current) return;

        const { left, right } = sliderRef.current.getBoundingClientRect();
        let newValue: number;

        if (latest < left) {
            setRegion("left");
            newValue = left - latest;
        } else if (latest > right) {
            setRegion("right");
            newValue = latest - right;
        } else {
            setRegion("middle");
            newValue = 0;
        }

        overflow.jump(decay(newValue, MAX_OVERFLOW));
    });

    const updateValue = (nextValue: number) => {
        setValue(nextValue);
        onChange?.(nextValue);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.buttons <= 0 || !sliderRef.current) return;

        const { left, width } = sliderRef.current.getBoundingClientRect();

        let nextValue =
            startingValue +
            ((event.clientX - left) / width) * (maxValue - startingValue);

        if (isStepped) {
            nextValue = Math.round(nextValue / stepSize) * stepSize;
        }

        nextValue = Math.min(Math.max(nextValue, startingValue), maxValue);

        updateValue(nextValue);
        clientX.jump(event.clientX);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        handlePointerMove(event);
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerUp = () => {
        animate(overflow, 0, { type: "spring", bounce: 0.5 });
    };

    const getRangePercentage = () => {
        const totalRange = maxValue - startingValue;
        if (totalRange === 0) return 0;

        return ((value - startingValue) / totalRange) * 100;
    };

    return (
        <>
            <motion.div
                onHoverStart={() => animate(scale, 1.2)}
                onHoverEnd={() => animate(scale, 1)}
                onTouchStart={() => animate(scale, 1.2)}
                onTouchEnd={() => animate(scale, 1)}
                style={{
                    scale,
                    opacity: useTransform(scale, [1, 1.2], [0.7, 1]),
                }}
                className="flex w-full touch-none select-none items-center justify-center gap-3"
            >
                <motion.div
                    animate={{
                        scale: region === "left" ? [1, 1.4, 1] : 1,
                        transition: { duration: 0.25 },
                    }}
                    style={{
                        x: useTransform(() =>
                            region === "left" ? -overflow.get() / scale.get() : 0
                        ),
                    }}
                    className="text-red-800"
                >
                    {leftIcon}
                </motion.div>

                <div
                    ref={sliderRef}
                    className="relative flex w-full max-w-xs grow cursor-grab touch-none select-none items-center py-4"
                    onPointerMove={handlePointerMove}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onLostPointerCapture={handlePointerUp}
                >
                    <motion.div
                        style={{
                            scaleX: useTransform(() => {
                                if (!sliderRef.current) return 1;

                                const { width } =
                                    sliderRef.current.getBoundingClientRect();

                                return 1 + overflow.get() / width;
                            }),
                            scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]),
                            transformOrigin: useTransform(() => {
                                if (!sliderRef.current) return "center";

                                const { left, width } =
                                    sliderRef.current.getBoundingClientRect();

                                return clientX.get() < left + width / 2 ? "right" : "left";
                            }),
                            height: useTransform(scale, [1, 1.2], [6, 12]),
                            marginTop: useTransform(scale, [1, 1.2], [0, -3]),
                            marginBottom: useTransform(scale, [1, 1.2], [0, -3]),
                        }}
                        className="flex grow"
                    >
                        <div className="relative h-full grow overflow-hidden rounded-full bg-red-100">
                            <div
                                className="absolute h-full rounded-full bg-red-800"
                                style={{ width: `${getRangePercentage()}%` }}
                            />
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    animate={{
                        scale: region === "right" ? [1, 1.4, 1] : 1,
                        transition: { duration: 0.25 },
                    }}
                    style={{
                        x: useTransform(() =>
                            region === "right" ? overflow.get() / scale.get() : 0
                        ),
                    }}
                    className="text-red-800"
                >
                    {rightIcon}
                </motion.div>
            </motion.div>

            <p className="absolute -top-2 text-xs font-bold tracking-wide text-red-800">
                {Math.round(value)}
            </p>
        </>
    );
}

function decay(value: number, max: number) {
    if (max === 0) return 0;

    const entry = value / max;
    const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);

    return sigmoid * max;
}