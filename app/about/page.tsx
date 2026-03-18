import Footer from "@/ui/components/Footer";
import Navbar from "@/ui/components/Navbar";
import Image from "next/image";

export default function About() {
  return (
    <>
      <Navbar />
      <div className="w-full flex flex-row justify-evenly font-display">
        <section>
          <p className="text-3xl font-bold my-8 underline decoration-wavy decoration-cream">
            About the Creator
          </p>
          <div style={{ fontSize: "14px", width: "40vw", minWidth: "20vw" }}>
            {" "}
            <p style={{ paddingTop: "10px" }}>
              This application was developed by Matt (see right).
            </p>
            <br />
            <p>
              Matt learned everything he knows about programming from strangers
              on the internet, and hundreds of hours in front of the computer.
              and he hopes you enjoy using Roastly. He's worked in a few cafes,
              and really loves his local coffee spots.
            </p>
            <p className="pt-5">
              This project is bootstrapped by people Matt knows, and maybe in
              the future by people like you!
            </p>
          </div>
        </section>
        <div className="w-60">
          <Image
            width={200}
            height={200}
            src="/matt.jpeg"
            alt="A picture of a young man with a long, curly mustache and glasses"
            className="rounded-2xl w-full h-auto mt-15"
          ></Image>
        </div>
      </div>
    </>
  );
}
