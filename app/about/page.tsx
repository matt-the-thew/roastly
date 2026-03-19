import Footer from "@/ui/components/Footer";
import Navbar from "@/ui/components/Navbar";
import Image from "next/image";

export default function About() {
  return (
    <>
      <Navbar />
      <div className="w-full font-display p-9">
        <section>
          <Image
            width={200}
            height={200}
            src="/matt.jpeg"
            alt="A picture of a young man with a long, curly mustache and glasses"
            className="rounded-2xl w-40 h-55 m-3 float-right"
          ></Image>
          <p className="text-md font-bold mt-8 underline decoration-wavy decoration-cream">
            About the Creator
          </p>{" "}
          <p style={{ paddingTop: "10px" }}>
            This application was developed by Matt (see right).
          </p>
          <br />
          <p>
            Matt learned everything he knows about programming from strangers on
            the internet, and hundreds of hours in front of the computer. and he
            hopes you enjoy using Roastly. He's worked in a few cafes, and
            really loves his local coffee spots.
          </p>
          <p className="pt-5">
            This project is bootstrapped by people Matt knows, and maybe in the
            future by people like you!
          </p>
        </section>
      </div>
    </>
  );
}
