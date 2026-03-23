import Button from "../Button";

export default function Footer() {
  return (
    <footer className="font-display bg-brew w-full h-20 fixed bottom-0 flex justify-center items-center">
      <div className="w-full flex justify-center gap-5">
        <Button content="About" linkTo="/about" variant="ghost"></Button>
        <Button
          content="Privacy Policy"
          linkTo="/privacy-policy"
          variant="ghost"
        ></Button>
      </div>
    </footer>
  );
}
