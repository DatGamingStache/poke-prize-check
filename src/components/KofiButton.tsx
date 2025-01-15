const KofiButton = () => {
  return (
    <a 
      href='https://ko-fi.com/H2H519101Y' 
      target='_blank' 
      rel="noopener noreferrer"
      className="inline-block hover:opacity-90 transition-opacity"
    >
      <img 
        height='36' 
        src='https://storage.ko-fi.com/cdn/kofi3.png?v=6' 
        alt='Buy Me a Coffee at ko-fi.com' 
        className="h-9"
      />
    </a>
  );
};

export default KofiButton;