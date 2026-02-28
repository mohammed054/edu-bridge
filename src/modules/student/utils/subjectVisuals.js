import arabicImage from '../../../assets/arabic.png';
import biologyImage from '../../../assets/biology.png';
import chemistryImage from '../../../assets/chemistry.png';
import islamicImage from '../../../assets/islamic-studies.png';
import mathImage from '../../../assets/math.png';
import physicsImage from '../../../assets/physics.png';
import socialImage from '../../../assets/social-studies.png';
import englishImage  from '../../../assets/english.png';


const SUBJECT_IMAGE_MAP = {
  الرياضيات: mathImage,
  'اللغة العربية': arabicImage,
  الفيزياء: physicsImage,
  الكيمياء: chemistryImage,
  الأحياء: biologyImage,
  'الدراسات الاجتماعية': socialImage,
  'التربية الإسلامية': islamicImage,
  'اللغة الانجليزية': englishImage,
};

/**
 * Returns the static image asset for a subject by name.
 * Falls back to a generic placeholder if the subject is not found.
 */
export function resolveSubjectImage(subjectName) {
  if (!subjectName) return mathImage; // sensible fallback
  // exact match
  if (SUBJECT_IMAGE_MAP[subjectName]) return SUBJECT_IMAGE_MAP[subjectName];
  // partial match (e.g. "اللغة الإنجليزية" vs "اللغة الانجليزية")
  const key = Object.keys(SUBJECT_IMAGE_MAP).find((k) =>
    subjectName.includes(k) || k.includes(subjectName)
  );
  return key ? SUBJECT_IMAGE_MAP[key] : mathImage;
}