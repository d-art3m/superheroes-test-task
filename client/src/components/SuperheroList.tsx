import { useEffect } from 'react';
import { useSuperhero } from '@/store/useSuperhero';
import SuperheroCard from './SuperheroCard';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';

const SuperheroList: React.FC = () => {
  const navigate = useNavigate();

  const superheroes = useSuperhero(state => state.superheroes);
  const totalHeroes = useSuperhero(state => state.totalHeroes);
  const currentPage = useSuperhero(state => state.currentPage);
  const limit = useSuperhero(state => state.limit);
  const loading = useSuperhero(state => state.loading.list);
  const error = useSuperhero(state => state.error);
  const fetchSuperheroes = useSuperhero(state => state.fetchSuperheroes);
  const clearSelectedSuperhero = useSuperhero(state => state.clearSelectedSuperhero);

  type PageToken = number | '..';

  const buildPaginationRange = (current: number, total: number): PageToken[] => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 2) {
      return [1, 2, '..', total];
    }

    if (current >= total - 1) {
      return [1, '..', total - 1, total];
    }

    return [1, '..', current, '..', total];
  }

  useEffect(() => {
    fetchSuperheroes(currentPage, limit);
    clearSelectedSuperhero();
  }, [fetchSuperheroes, currentPage, limit, clearSelectedSuperhero]);

  const handlePageChange = (newPage: number) => {
    fetchSuperheroes(newPage, limit);
  };

  const totalPages = Math.ceil(totalHeroes / limit);
  const paginationItems = buildPaginationRange(currentPage, totalPages);

  return (
    <div className="container mx-auto px-4 py-8 w-full max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold tracking-tight">Our Heroes</h2>
        <Button size="lg" onClick={() => navigate('/superhero/add')}>
          <PlusCircle className="mr-2 size-5" />
          Add Superhero
        </Button>
      </div>

      {loading && <Loader />}
      
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

          {totalPages > 1 && (
             <Pagination className="mt-12">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {paginationItems.map((item, index) => (
                  <PaginationItem key={index}>
                    {typeof item === 'number' ? (
                      <PaginationLink
                        href="#"
                        isActive={currentPage === item}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(item);
                        }}
                      >
                        {item}
                      </PaginationLink>
                    ) : (
                      <PaginationEllipsis />
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default SuperheroList;
