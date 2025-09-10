// components/Checkbox.tsx
import React from 'react';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="cursor-pointer w-4 h-4"
    />
  );
};

export default Checkbox;
