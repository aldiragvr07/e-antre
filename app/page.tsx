import Hero from "./components/Hero";
import Categories from "./components/Categories";
import UpcomingEvents from "./components/UpcomingEvents";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <UpcomingEvents />
      <Newsletter />
      <Footer />
    </>
  );
}
