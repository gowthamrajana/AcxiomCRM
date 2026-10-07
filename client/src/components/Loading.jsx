export default function Loading({ text = "Loading..." }) {
  return (
    <div className="loading-container">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>

      <span>{text}</span>
    </div>
  );
}