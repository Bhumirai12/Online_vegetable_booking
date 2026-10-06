import { FiTruck, FiShield, FiCreditCard } from "react-icons/fi";

const benefits = [
  {
    icon: FiTruck,
    title: "Convenient Delivery",
    text: "Delivery details are saved with your order.",
  },
  {
    icon: FiShield,
    title: "Secure Access",
    text: "Safe, secure, and seamless access every time.",
  },
  {
    icon: FiCreditCard,
    title: "Flexible Payment",
    text: "Cash on Delivery or Razorpay online payment.",
  },
];

export default function Benefits() {
  return (
    <div className="container benefits">
      {benefits.map(({ icon: Icon, title, text }) => (
        <div className="benefit" key={title}>
          <span className="iconbox">
            <Icon />
          </span>
          <span>
            <b>{title}</b>
            <small>{text}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
