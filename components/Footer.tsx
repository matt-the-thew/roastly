import Button from "./Button";

export default function Footer() {
  return (
    <footer className="font-display bg-brew w-full h-20 fixed bottom-0 flex justify-center items-center">
      <div className="w-20">
        <Button content="About" linkTo="/about" variant="ghost"></Button>
      </div>
    </footer>
  );
}
