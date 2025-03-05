interface HeadingProps {
  label: string;
}

const Heading: React.FC<HeadingProps> = ({ label }) => {
  return (
    <div className="font-bold text-4xl pt-6">
      {label}
    </div>
  );
};

export default Heading;
