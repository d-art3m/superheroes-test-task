import { useEffect } from 'react';
import { useSuperhero } from '@/store/useSuperhero';
import SuperheroCard from './SuperheroCard';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuperheroList: React.FC = () => {
  const navigate = useNavigate();

  const superheroes = useSuperhero(state => state.superheroes);
  const totalHeroes = useSuperhero(state => state.totalHeroes);
  const currentPage = useSuperhero(state => state.currentPage);
  const limit = useSuperhero(state => state.limit);
  const loading = useSuperhero(state => state.loading.list);
  const error = useSuperhero(state => state.error);
  const fetchSuperheroes = useSuperhero(state => state.fetchSuperheroes);

  useEffect(() => {
    fetchSuperheroes(currentPage, limit);
  }, [fetchSuperheroes, currentPage, limit]);

  const handlePageChange = (newPage: number) => {
    fetchSuperheroes(newPage, limit);
  };

  const totalPages = Math.ceil(totalHeroes / limit);

  return (
    <div className="container mx-auto px-4 py-8 w-full max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold tracking-tight">Our Heroes</h2>
        <Button size="lg" onClick={() => navigate('/superhero/add')}>
          <PlusCircle className="mr-2 size-5" />
          Add Superhero
        </Button>
      </div>

      {loading && <p className="text-center text-lg">Loading heroes...</p>}
      {error && (
        <p className="text-center text-lg text-destructive">Error: {error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {superheroes.map(hero => (
              <SuperheroCard key={hero.id} superhero={hero} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-muted-foreground">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperheroList;
