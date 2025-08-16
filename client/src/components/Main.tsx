import { Route, Routes } from 'react-router-dom';
import SuperheroList from './SuperheroList';
import SuperheroProfile from './SuperheroProfile';
import NotFound from './NotFound';
import SuperheroAddEdit from './SuperheroAddEdit';

const Main: React.FC = () => {
  return (
    <main className="flex flex-col items-center justify-center m-4">
      <Routes>
        <Route path="/" element={<SuperheroList />} />
        <Route path="/superhero/add" element={<SuperheroAddEdit />} />
        <Route path="/superhero/:id" element={<SuperheroProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

export default Main;
