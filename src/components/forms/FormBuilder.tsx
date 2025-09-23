import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { FormField } from '@/types';

interface FormBuilderProps {
  schema: FormField[];
  onSchemaChange: (schema: FormField[]) => void;
  maxFields?: number;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ 
  schema, 
  onSchemaChange, 
  maxFields = 20 
}) => {
  const fieldTypes = [
    { value: 'textarea', label: 'Text Area' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'file', label: 'File Upload' }
  ];

  const addField = (type: FormField['type']) => {
    if (schema.length >= maxFields) return;

    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: '',
      required: false,
      placeholder: type === 'textarea' ? 'Enter your response...' : undefined,
      options: type === 'radio' || type === 'checkbox' ? ['Option 1'] : undefined
    };

    onSchemaChange([...schema, newField]);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    onSchemaChange(schema.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const removeField = (fieldId: string) => {
    onSchemaChange(schema.filter(field => field.id !== fieldId));
  };

  const addOption = (fieldId: string) => {
    updateField(fieldId, {
      options: [...(schema.find(f => f.id === fieldId)?.options || []), `Option ${(schema.find(f => f.id === fieldId)?.options?.length || 0) + 1}`]
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = schema.find(f => f.id === fieldId);
    if (field?.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = schema.find(f => f.id === fieldId);
    if (field?.options) {
      updateField(fieldId, {
        options: field.options.filter((_, index) => index !== optionIndex)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Registration Form Builder</h3>
          <p className="text-sm text-muted-foreground">
            Create custom registration questions ({schema.length}/{maxFields} fields)
          </p>
        </div>
        
        <Select onValueChange={(type) => addField(type as FormField['type'])}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Add Field" />
          </SelectTrigger>
          <SelectContent>
            {fieldTypes.map(type => (
              <SelectItem 
                key={type.value} 
                value={type.value}
                disabled={schema.length >= maxFields}
              >
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {schema.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No custom fields added yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add fields using the dropdown above to create a custom registration form.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schema.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{fieldTypes.find(t => t.value === field.type)?.label}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(field.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Field Label *</Label>
                    <Input
                      placeholder="Enter field label"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                    />
                    <Label>Required field</Label>
                  </div>
                </div>

                {(field.type === 'textarea' || field.type === 'number') && (
                  <div className="space-y-2">
                    <Label>Placeholder Text</Label>
                    <Input
                      placeholder="Enter placeholder text"
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                    />
                  </div>
                )}

                {field.type === 'number' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Value</Label>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={field.validation?.min || ''}
                        onChange={(e) => updateField(field.id, { 
                          validation: { ...field.validation, min: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Value</Label>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={field.validation?.max || ''}
                        onChange={(e) => updateField(field.id, { 
                          validation: { ...field.validation, max: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                )}

                {(field.type === 'radio' || field.type === 'checkbox') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Options</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(field.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {field.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                          />
                          {field.options!.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(field.id, optionIndex)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormBuilder;