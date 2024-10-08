import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // 我们将保留这个自定义属性，但在组件中使用它
  customProp?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, customProp, ...props }, ref) => {
    // 使用 customProp 来演示它的用途
    const customClass = customProp ? `custom-${customProp}` : ''

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          customClass,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }