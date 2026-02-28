import { useState } from 'react';
import { generateMessage } from '../utils/generateMessage.js';

export default function MessageGenerator({ studentName, tags, notes, audience = 'parent', onMessage }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const output = await generateMessage({ studentName, tags, notes, audience });
    onMessage(output);
    setLoading(false);
  };

  return (
    <button className="btn btn-soft" type="button" onClick={handleGenerate} disabled={loading}>
      {loading ? 'Generating...' : 'Generate AI Message'}
    </button>
  );
}
