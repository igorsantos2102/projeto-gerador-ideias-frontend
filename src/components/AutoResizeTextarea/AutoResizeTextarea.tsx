import React from 'react';
import { cn } from '@/lib/utils'


type AutoResizeTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  maxChars?: number;
};

const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  maxChars,
  ...props
}) => {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (maxChars) {
      e.target.value = e.target.value.slice(0, maxChars);
    }

    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }

    props.onChange?.(e);
  };

  return (
    <textarea
      {...props}
      ref={ref}
      onChange={handleChange}
      rows={1}
      className={cn(
        "resize-none overflow-hidden",
        props.className
      )}
    />
  );
};

export default AutoResizeTextarea;
