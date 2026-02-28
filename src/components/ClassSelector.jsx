export default function ClassSelector({ classOptions, value, onChange }) {
  return (
    <section className="card stack">
      <label htmlFor="classSelector"><b>Select Class</b></label>
      <select
        id="classSelector"
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {classOptions.map((className) => (
          <option key={className} value={className}>
            {className}
          </option>
        ))}
      </select>
    </section>
  );
}
