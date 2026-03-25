import Footer from "@/ui/components/LandingPage/Footer";
import Navbar from "@/ui/components/LandingPage/Navbar";
import Image from "next/image";
import Link from "next/link";
import ImageWithTextOverlay from "@/ui/components/ImageWithTextOverlay";

export default function About() {
  return (
    <>
      <Navbar />

      <div className="max-w-250 mx-auto font-display p-9">
        <ImageWithTextOverlay
          text="About the creator"
          alt="this is the alt text"
          src="/matt-headshot.jpeg"
          size={{ width: 200, height: 200 }}
        />
        <section className="*:pt-5">
          <p>
            &emsp;&emsp;Roastly wasn’t built in a boardroom, but a bedroom,
            specifically the one that I have, above my parent’s garage. I
            believe that technology should make people feel less alone, instead
            of optimizing their lives. It’s an attempt to support coffee culture
            not as content, but as culture. To give cafés, roasters, baristas,
            and the people they serve a shared map, and a shared place to exist
            online. I am trying to give this cultural movement a home, so it can
            grow and evolve. I want to see what spaces you create; I want to try
            your version of tradition.
          </p>
          <br />
          <h2>Who am I?</h2>
          <br />
          <p>I’m Matt (Hello). </p>
          <Image
            src={"/matt-bedroom.jpeg"}
            alt="A picutre of a young man sitting at a desk, in a messy bedroom, with a computer open behind him."
            width={500}
            height={500}
            className="w-full"
          />
          <br />
          <p>
            &emsp;&emsp;I didn’t start in tech; I started in music. Before I
            wrote software, I sang classical music across the greater LA area,
            and released independent rock & roll (still do!). Music taught me
            systems early: how ensembles synchronize, how communities form
            around shared taste, how culture survives through repetition, care,
            and a mutual love of the pursuit of greatness.
          </p>
          <br />
          <p>
            &emsp;&emsp;When I was one year old, I started messing with my dad’s
            computer, and many computers (and a lot of study) later, I’m still
            going strong. For five years, I worked behind increasingly good cafe
            counters, which functioned as rare spaces where strangers talk and
            people meet. I think that’s a beautiful thing, and the world could
            use more of it. So I designed and built Roastly. I hope you enjoy
            it.
          </p>
          <div className="w-full max-w-150 aspect-square overflow-hidden justify-self-center">
            <Image
              src={"/matt-steaming-milk.jpeg"}
              alt="The same man picutred above, but now cleanshaven, in a cloud of steam at an espresso machine."
              width={800}
              height={800}
              className="object-top object-cover"
            />
          </div>
          <br />
          <p>
            If you’re here because you love coffee, community, and craft,
            welcome. You’re exactly who I built this for.
          </p>
          <div className="h-10"></div>
        </section>
        <Link href="/">
          <button className="p-4 bg-brew text-white rounded-lg hover:bg-cream cursor-pointer active:border active:border-brew">
            Go Back
          </button>
        </Link>
      </div>
      <Footer />
    </>
  );
}
