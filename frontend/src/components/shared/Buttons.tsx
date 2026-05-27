"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { THEME } from "@/constants/theme";

interface CustomButtonProps extends React.ComponentProps<typeof Button> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function PrimaryButton({ children, icon, className = "", ...props }: CustomButtonProps) {
  return (
    <motion.div
      whileHover={THEME.ANIMATIONS.hover}
      whileTap={THEME.ANIMATIONS.tap}
      className="inline-block w-full sm:w-auto"
    >
      <Button 
        className={`w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all ${className}`}
        {...props}
      >
        {children}
        {icon && <span className="ml-2">{icon}</span>}
      </Button>
    </motion.div>
  );
}

export function SecondaryButton({ children, icon, className = "", ...props }: CustomButtonProps) {
  return (
    <motion.div
      whileHover={THEME.ANIMATIONS.hover}
      whileTap={THEME.ANIMATIONS.tap}
      className="inline-block w-full sm:w-auto"
    >
      <Button 
        variant="outline"
        className={`w-full sm:w-auto bg-white border-2 border-secondary text-gray-800 hover:bg-secondary/10 transition-all shadow-sm hover:shadow-md ${className}`}
        {...props}
      >
        {children}
        {icon && <span className="ml-2">{icon}</span>}
      </Button>
    </motion.div>
  );
}
