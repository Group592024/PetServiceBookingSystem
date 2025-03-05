import React from "react";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import Hero from "../../../components/HomePage/Hero/Hero";
import Services from '../../../components/HomePage/Services/Services';
import About from '../../../components/HomePage/About/About';
import Review from '../../../components/HomePage/Review/Review';
import Contact from '../../../components/HomePage/Contact/Contact';
import Footer from '../../../components/HomePage/Footer/Footer';
import Copyright from '../../../components/HomePage/Copyright/Copyright';
import AllService from "../../../components/HomePage/AllService/AllService";
import ScrollToTop from './ScrollToTop';
import { Link } from "react-router-dom";
const Homepage = () => {
  return (
    <div>
      <NavbarCustomer />
      <div className="overflow-hidden">
      <Hero />
      <Services />
      <AllService/>
      <About />
      <Review />
      <Contact />
      <Footer />
      <Copyright />
      <ScrollToTop />
      </div>
    </div>
  );
};

export default Homepage;
