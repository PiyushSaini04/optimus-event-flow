import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, DynamicFormProps } from '@/types';

const DynamicForm: React.FC<DynamicFormProps> = ({ schema, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    schema.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }

      // Type-specific validation
      if (formData[field.id]) {
        switch (field.type) {
          case 'number':
            const numValue = Number(formData[field.id]);
            if (isNaN(numValue)) {
              newErrors[field.id] = 'Must be a valid number';
            } else {
              if (field.validation?.min && numValue < field.validation.min) {
                newErrors[field.id] = `Must be at least ${field.validation.min}`;
              }
              if (field.validation?.max && numValue > field.validation.max) {
                newErrors[field.id] = `Must be at most ${field.validation.max}`;
              }
            }
            break;
          case 'date':
            if (!Date.parse(formData[field.id])) {
              newErrors[field.id] = 'Must be a valid date';
            }
            break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.id];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              min={field.validation?.min}
              max={field.validation?.max}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              value={formData[field.id] || ''}
              onValueChange={(value) => handleInputChange(field.id, value)}
            >
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}_${index}`} />
                  <Label htmlFor={`${field.id}_${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}_${index}`}
                    checked={(formData[field.id] || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = formData[field.id] || [];
                      const newValues = checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option);
                      handleInputChange(field.id, newValues);
                    }}
                  />
                  <Label htmlFor={`${field.id}_${index}`}>{option}</Label>
                </div>
              ))}
            </div>
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        );

      case 'file':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="file"
              onChange={(e) => handleInputChange(field.id, e.target.files?.[0])}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="text"
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Registration Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {schema.map(renderField)}
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Submit Registration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DynamicForm;