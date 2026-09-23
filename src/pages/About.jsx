import Navbar from "../components/Navbar";

function About() {
  return (
    <>
      <Navbar />

      <main className="page">
        <section className="simple-page">
          <p className="section-label">OUR STORY</p>

          <h1>About Thrift by Njeri</h1>

          <p>
            Thrift by Njeri is all about making stylish fashion accessible,
            affordable and fun.
          </p>

          <p>
            We carefully select pieces that bring personality to your wardrobe,
            so you can discover beautiful looks without spending too much.
          </p>

          <p>
            Whether you're looking for something for a casual day out, a
            special occasion or simply want to refresh your wardrobe, there is
            always something waiting for you.
          </p>

          <h2>Affordable. Stylish. Yours.</h2>
        </section>
      </main>
    </>
  );
}

export default About;