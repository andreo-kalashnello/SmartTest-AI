"use client";

import { Loader2 } from "lucide-react";

import { Button, type ButtonProps } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  loading,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(className)}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
