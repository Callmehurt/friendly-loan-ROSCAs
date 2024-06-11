import Stripe from "stripe";

const keys = {
    public:
      "pk_test_51PLrF22NkpF8PrgLxQ6m16K4jDbULe0KBleA4dwDHtXEeYD9RHdnVSd7O8L5HGGQqH3Ke7AhBo0lLzrI6zeHoGYi00WXG2oZZS",
    secret:
      "sk_test_51PLrF22NkpF8PrgL171HSXQcyDcOsSEG98UCOK56oAlHgcgRSGYAomC6QlTq6ltuWzC5NPiVSodTqOgHtekXjGCU00O0Zek1Mj",
  };


  const stripePayment = new Stripe(keys.secret);

  export {stripePayment};