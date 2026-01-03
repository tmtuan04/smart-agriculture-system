import type { ModeType } from "@/app/(tab)/components/ModeCard";

export const mapBackendModeToUI = (mode: string): ModeType => {
    switch (mode) {
        case "manual":
            return "MANUAL";
        case "auto":
            return "AUTO";
        case "ai":
            return "AI";
        default:
            return "MANUAL";
    }
};