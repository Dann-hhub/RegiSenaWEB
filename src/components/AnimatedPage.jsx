// components/AnimatedPage.jsx
export default function AnimatedPage({ children }) {
  return (
    <div className="fade-in">
      {children}
    </div>
  );
}