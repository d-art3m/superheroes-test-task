import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-cyan-900 shadow p-4 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-white">
        <Link to="/">Superheroes</Link>
      </h1>
    </header>
  );
}

export default Header;
