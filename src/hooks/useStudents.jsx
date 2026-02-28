import { useMemo, useState } from 'react';
import { generateFeedbackSuggestions, saveFeedback } from '../services/feedbackService.js';

const INITIAL_STUDENTS = [
  { id: 'STD-001', name: 'أحمد سالم', grade: 'الصف السادس' },
  { id: 'STD-002', name: 'مريم خالد', grade: 'الصف الخامس' },
  { id: 'STD-003', name: 'فاطمة ناصر', grade: 'الصف السابع' },
  { id: 'STD-004', name: 'يوسف علي', grade: 'الصف الرابع' },
  { id: 'STD-005', name: 'هند راشد', grade: 'الصف الثامن' },
];

export function useStudents() {
  const [students] = useState(INITIAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [feedbackByStudent, setFeedbackByStudent] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredStudents = useMemo(() => {
    const value = searchTerm.trim();

    if (!value) {
      return students;
    }

    return students.filter((student) => student.name.includes(value) || student.grade.includes(value));
  }, [searchTerm, students]);

  const openFeedback = (student) => {
    setSelectedStudent(student);
    setFeedbackText('');
    setSuggestions([]);
    setErrorMessage('');
  };

  const closeFeedback = () => {
    setSelectedStudent(null);
    setFeedbackText('');
    setSuggestions([]);
    setErrorMessage('');
  };

  const requestSuggestions = async () => {
    const result = await generateFeedbackSuggestions(feedbackText);
    setSuggestions(result);
  };

  const submitFeedback = async () => {
    const text = feedbackText.trim();

    if (!selectedStudent || !text) {
      setErrorMessage('يرجى كتابة الملاحظة قبل الحفظ.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const saved = await saveFeedback({ studentId: selectedStudent.id, note: text });

      setFeedbackByStudent((current) => ({
        ...current,
        [selectedStudent.id]: saved,
      }));

      closeFeedback();
    } finally {
      setIsSaving(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredStudents,
    selectedStudent,
    openFeedback,
    closeFeedback,
    feedbackText,
    setFeedbackText,
    suggestions,
    requestSuggestions,
    submitFeedback,
    errorMessage,
    isSaving,
    feedbackByStudent,
  };
}
