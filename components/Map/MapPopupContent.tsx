interface PopupContentProps {
  name: string;
  description: string;
}

export default function PopupContent({ name, description }: PopupContentProps) {
  return (
    <div className="flex flex-col w-full font-display">
      <h1 className="text-2xl self-center text-center bg-white p-5 w-[80%] rounded-xl">
        {name}
      </h1>
      <p className="mt-4 px-8 pt-4 text-[0.8rem] bg-white w-[90%] self-center rounded-xl min-h-60">
        {description}
      </p>
    </div>
  );
}
