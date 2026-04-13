export interface Props {
  visible: boolean;
  children: React.ReactNode;
  numberOfCafes: number;
}

export default function App({ visible, children, numberOfCafes }: Props) {
  return (
    <div className="fixed z-2 h-[95vh] w-113 top-[2.5vh] left-8 bg-background rounded-xl animate-slide-in flex flex-col items-center overflow-auto">
      <h1 className="w-full text-sm text-foreground font-mono font-bold p-4 text-right">
        {numberOfCafes ? numberOfCafes : `?`} cafes available
      </h1>
      {children}
      <h2 className="text-base mt-4">Don't see your favorite cafe?</h2>
      <h3 className="text-primary text-[1rem] italic hover:underline cursor-pointer">
        Suggest an Addition
      </h3>
    </div>
  );
}
