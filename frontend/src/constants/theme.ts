export const THEME = {
  APP_NAME: "EduTech AI",
  COLORS: {
    primary: "#a855f7", // Vibrant purple
    secondary: "#3b82f6", // Bright blue
    success: "#22c55e",
    warning: "#eab308",
    danger: "#ef4444",
    background: "#09090b",
    cardBg: "rgba(24, 24, 27, 0.6)", // Glass effect
  },
  ANIMATIONS: {
    spring: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
    tween: {
      type: "tween" as const,
      duration: 0.3,
      ease: "easeInOut" as const,
    },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  },
};

export const CLASS_OPTIONS = [
  { id: "5", label: "Class 5" },
  { id: "6", label: "Class 6" },
  { id: "7", label: "Class 7" },
  { id: "8", label: "Class 8" },
  { id: "9", label: "Class 9" },
  { id: "10", label: "Class 10" },
];

export const BOARD_OPTIONS = [
  { id: "cbse", label: "CBSE" },
  { id: "icse", label: "ICSE" },
  { id: "state", label: "State Board" },
];

export const SUBJECTS = [
  { id: "math", name: "Mathematics", icon: "Calculator", color: "text-blue-500" },
  { id: "sci", name: "Science", icon: "FlaskConical", color: "text-green-500" },
  { id: "eng", name: "English", icon: "BookOpen", color: "text-purple-500" },
  { id: "sst", name: "Social Studies", icon: "Globe", color: "text-orange-500" },
  { id: "phy", name: "Physics", icon: "Zap", color: "text-yellow-500" },
  { id: "chem", name: "Chemistry", icon: "TestTube", color: "text-pink-500" },
  { id: "bio", name: "Biology", icon: "Leaf", color: "text-green-600" },
];
