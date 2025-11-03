import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  type = "text", 
  error, 
  required = false,
  className,
  children,
  ...props 
}) => {
  const renderInput = () => {
    if (type === "select") {
      return (
        <Select
          className={cn(error && "border-error focus:border-error focus:ring-error/20")}
          {...props}
        >
          {children}
        </Select>
      );
    }

    if (type === "textarea") {
      return (
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 form-input transition-all duration-200",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:border-gray-400 resize-vertical",
            error && "border-error focus:border-error focus:ring-error/20"
          )}
          {...props}
        />
      );
    }

    return (
      <Input
        type={type}
        className={cn(error && "border-error focus:border-error focus:ring-error/20")}
        {...props}
      />
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-error")}>
          {label}
        </Label>
      )}
      {renderInput()}
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;