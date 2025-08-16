import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SuperheroWithImages } from '@/types/superhero.types';

import notFound from '/image-not-found.svg';

interface SuperheroCardProps {
  superhero: SuperheroWithImages;
}

const SuperheroCard: React.FC<SuperheroCardProps> = ({ superhero }) => {
  const imageUrl = superhero.images[0]?.url || notFound;

  return (
    <Link to={`/superhero/${superhero.id}`} className="group outline-none">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 focus-visible:ring-ring/50 focus-visible:ring-[3px]">
        <CardContent className="p-0">
          <div className="relative w-full aspect-square">
            <img
              src={imageUrl}
              alt={`Image of ${superhero.nickname}`}
              className="absolute inset-0 w-full h-full object-cover"
              onError={e => {
                e.currentTarget.src = notFound;
              }}
            />
          </div>
        </CardContent>
        <CardHeader>
          <CardTitle className="text-center text-2xl tracking-tight">
            {superhero.nickname}
          </CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default SuperheroCard;
