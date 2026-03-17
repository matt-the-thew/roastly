interface PopupContentProps {
  name: string;
  description: string;
}

export default function PopupContent({ name, description }: PopupContentProps) {
  return (
    <div className="flex flex-col w-full font-display">
      <h1 className="text-2xl self-center">{name}</h1>
      <p className="mt-4 px-8">{description}</p>
    </div>
  );
}
