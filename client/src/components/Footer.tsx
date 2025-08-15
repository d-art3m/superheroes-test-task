const Footer: React.FC = () => {
  return (
    <footer className="bg-cyan-700 text-center p-1 text-sm text-white">
      © {new Date().getFullYear()}
    </footer>
  );
}

export default Footer;
