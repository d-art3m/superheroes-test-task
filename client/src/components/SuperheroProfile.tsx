import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuperhero } from '@/store/useSuperhero';
import { Button } from '@/components/ui/button';
import SuperheroAddEdit from './SuperheroAddEdit';
import { ArrowLeft, FilePenLine, Trash2 } from 'lucide-react';
import notFound from '/image-not-found.svg';

const SuperheroProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const selectedSuperhero = useSuperhero(state => state.selectedSuperhero);
  const loading = useSuperhero(state => state.loading);
  const error = useSuperhero(state => state.error);
  const fetchSuperheroById = useSuperhero(state => state.fetchSuperheroById);
  const deleteSuperhero = useSuperhero(state => state.deleteSuperhero);
  const clearSelectedSuperhero = useSuperhero(state => state.clearSelectedSuperhero);

  useEffect(() => {
    if (id) {
      fetchSuperheroById(id);
    }
    return () => {
      clearSelectedSuperhero();
    };
  }, [id, fetchSuperheroById, clearSelectedSuperhero]);

  const [mainImage, setMainImage] = useState<string | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (selectedSuperhero?.images && selectedSuperhero.images.length > 0) {
      setMainImage(selectedSuperhero.images[0].url);
    } else {
      setMainImage(notFound);
    }
  }, [selectedSuperhero]);

  const handleDelete = async () => {
    if (
      id &&
      window.confirm('Are you sure you want to delete this superhero?')
    ) {
      await deleteSuperhero(id);
      navigate('/');
    }
  };

  if (loading.details) {
    return (
      <p className="text-center text-lg animate-pulse">
        Loading hero details...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-lg text-destructive">Error: {error}</p>
    );
  }

  if (isEditing) {
    return <SuperheroAddEdit />;
  }

  if (!selectedSuperhero) {
    return <p className="text-center text-lg">Superhero not found</p>;
  }

  return (
    <div className="container mx-auto p-4 w-full max-w-5xl">
      <div className="flex justify-end items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft />
          Back
        </Button>
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          <FilePenLine />
          Edit
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden border">
            <img
              src={mainImage}
              alt={`Main image of ${selectedSuperhero.nickname}`}
              className="w-full h-full object-cover"
              onError={e => {
                e.currentTarget.src = notFound;
              }}
            />
          </div>
          {selectedSuperhero.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {selectedSuperhero.images.map(image => (
                <button
                  key={image.url}
                  className={`aspect-square rounded-md overflow-hidden outline-none transition-all focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
                    mainImage === image.url
                      ? 'ring-primary/80 ring-[3px]'
                      : 'hover:opacity-80'
                  }`}
                  onClick={() => setMainImage(image.url)}
                >
                  <img
                    src={image.url}
                    alt={`Image of ${selectedSuperhero.nickname}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tighter">
              {selectedSuperhero.nickname}
            </h1>
            <p className="text-xl text-muted-foreground mt-1">
              {selectedSuperhero.realName}
            </p>
          </div>

          {selectedSuperhero.catchPhrase && (
            <blockquote className="border-l-4 pl-4 italic text-lg">
              "{selectedSuperhero.catchPhrase}"
            </blockquote>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-2">Origin Description</h2>
            <p className="text-foreground/80 leading-relaxed">
              {selectedSuperhero.originDescription}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3">Superpowers</h2>
            <div className="flex flex-wrap gap-2">
              {selectedSuperhero.superpowers.map(power => (
                <span
                  key={power}
                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium"
                >
                  {power}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperheroProfile;
