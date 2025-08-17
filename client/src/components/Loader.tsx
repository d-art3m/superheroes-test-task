import { Loader2 } from 'lucide-react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

export default Loader;