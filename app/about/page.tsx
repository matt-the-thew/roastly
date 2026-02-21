import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Grid } from "@chakra-ui/react";
import Image from "next/image";

export default function About() {
  return (
    <>
      <Grid minH="100dvh" templateRows="auto 1fr auto">
        <Navbar />
        <div className="w-full flex flex-row justify-evenly">
          <section>
            <p
              style={{
                fontSize: "30px",
                fontWeight: "bold",
                paddingTop: "20px",
              }}
            >
              About the Creator
            </p>
            <div style={{ fontSize: "14px", width: "40vw", minWidth: "20vw" }}>
              {" "}
              <p style={{ paddingTop: "10px" }}>
                This application was developed by Matt, pictured to the right,
                who happens to be me.
              </p>
              <br />
              <p>
                I taught myself everything I know about programming, and I hope
                you enjoy using Roastly. After many years enjoying specialty
                coffee, followed by
                <span style={{ fontStyle: "italic" }}>working </span>
                in specialty coffee, I understands the value of finding a good
                local cafe. These places are magical, and make real differences
                in people's lives.
              </p>
              <p className="pt-5">
                Another part of this whole project is lifting up small
                businesses, especially those who practice a craft at a
                phenomenal level. So many of these places have a fraction of the
                notoriety that they deserve.
              </p>
            </div>
          </section>
          <div className="w-50">
            <Image
              width={200}
              height={200}
              src="/matt.jpg"
              alt="A picture of a young man with a long, curly mustache"
              className="rounded-2xl w-full h-auto pt-5"
            ></Image>
          </div>
        </div>
        <Footer />
      </Grid>
    </>
  );
}
