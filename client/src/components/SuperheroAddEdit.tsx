import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSuperhero } from '@/store/useSuperhero';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { X, Upload, Plus, Loader2 } from 'lucide-react';
import Loader from './Loader';

const formSchema = z.object({
  nickname: z
    .string()
    .min(2, { message: 'Nickname must be at least 2 characters.' })
    .max(30, { message: 'Nickname must be at most 30 characters.' }),
  realName: z
    .string()
    .min(2, { message: 'Real name must be at least 2 characters.' })
    .max(30, { message: 'Real name must be at most 30 characters.' }),
  originDescription: z
    .string()
    .min(10, { message: 'Origin must be at least 10 characters.' }),
  catchPhrase: z
    .string()
    .min(2, { message: 'Catch phrase must be at least 2 characters.' }),
  superpowers: z
    .array(z.string().min(1))
    .min(1, { message: 'At least one superpower is required.' }),
});

type SuperheroFormData = z.infer<typeof formSchema>;

type Props = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

const SuperheroAddEdit: React.FC<Props> = ({ onCancel, onSuccess }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const selectedSuperhero = useSuperhero(state => state.selectedSuperhero);
  const createSuperhero = useSuperhero(state => state.createSuperhero);
  const updateSuperhero = useSuperhero(state => state.updateSuperhero);
  const uploadImage = useSuperhero(state => state.uploadImage);
  const loading = useSuperhero(state => state.loading);
  const error = useSuperhero(state => state.error);
  const setError = useSuperhero(state => state.setError);
  const clearSelectedSuperhero = useSuperhero(
    state => state.clearSelectedSuperhero,
  );

  const [powerInput, setPowerInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<SuperheroFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: '',
      realName: '',
      originDescription: '',
      catchPhrase: '',
      superpowers: [],
    },
  });

  useEffect(() => {
    return () => {
      setError(null);
      if (!isEditMode) {
        clearSelectedSuperhero();
      }
    };
  }, [setError, clearSelectedSuperhero, isEditMode]);

  useEffect(() => {
    if (isEditMode && selectedSuperhero) {
      form.reset({
        nickname: selectedSuperhero.nickname,
        realName: selectedSuperhero.realName,
        originDescription: selectedSuperhero.originDescription,
        catchPhrase: selectedSuperhero.catchPhrase,
        superpowers: selectedSuperhero.superpowers,
      });
      setImageUrls(selectedSuperhero.images.map(img => img.url) || []);
    }
  }, [selectedSuperhero, isEditMode, form]);

  const handleAddPower = () => {
    const trimmedPower = powerInput.trim();
    if (!trimmedPower) return;

    const currentPowers = form.getValues("superpowers");
    if (!currentPowers.includes(trimmedPower)) {
      form.setValue("superpowers", [...currentPowers, trimmedPower], { shouldValidate: true });
      setPowerInput('');
    }
  };

  const handleRemovePower = (powerToRemove: string) => {
    const updated = form.getValues("superpowers").filter(p => p !== powerToRemove);
    form.setValue("superpowers", updated, { shouldValidate: true });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter((url): url is string => !!url);
      setImageUrls(prev => [...prev, ...validUrls]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setImageUrls(imageUrls.filter(url => url !== urlToRemove));
  };

  const onSubmit = async (data: SuperheroFormData) => {
    const payload = { ...data, images: imageUrls };
    const result = isEditMode
      ? await updateSuperhero(id, payload)
      : await createSuperhero(payload);

    const submissionError = useSuperhero.getState().error;
    if (!submissionError) {
      if (onSuccess) {
        onSuccess();
      }
      const heroId = result?.id;
      navigate(heroId ? `/superhero/${heroId}` : '/');
    }
  };

  const isLoading = loading.create || loading.update;

  if (isEditMode && loading.details) {
    return <Loader />;
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-3xl">
          {isEditMode ? 'Edit Superhero' : 'Create New Superhero'}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Superman" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="realName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Real Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Clark Kent" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="catchPhrase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catch Phrase</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Up, up and away!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="originDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the hero's origin..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="superpowers"
              render={() => (
                <FormItem>
                  <FormLabel>Superpowers</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("superpowers").map(power => (
                      <Badge
                        key={power}
                        variant="secondary"
                        className="pl-3 pr-1 py-1 text-sm"
                      >
                        {power}
                        <button
                          type="button"
                          onClick={() => handleRemovePower(power)}
                          className="ml-2 rounded-full outline-none hover:bg-destructive/20 p-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Input
                      value={powerInput}
                      onChange={e => setPowerInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPower();
                          }
                        }}
                      placeholder="e.g., Flight"
                    />
                    <Button type="button" onClick={handleAddPower}>
                      <Plus className="mr-2 size-4" />
                      Add
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Images</FormLabel>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {imageUrls.map(url => (
                  <div key={url} className="relative group aspect-square">
                    <img
                      src={url}
                      alt="Superhero"
                      className="w-full h-full object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(url)}
                      className="absolute top-1 right-1 bg-destructive/80 text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
                <label
                  className={cn(
                    'flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed cursor-pointer hover:bg-accent/50 transition-colors',
                    isUploading && 'cursor-not-allowed opacity-50',
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="size-8 text-muted-foreground" />
                  )}
                  <span className="mt-2 text-xs text-center text-muted-foreground">
                    Upload
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="sr-only"
                  />
                </label>
              </div>
            </FormItem>

            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-4 mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => (onCancel ? onCancel() : navigate(-1))}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Create Hero'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SuperheroAddEdit;
